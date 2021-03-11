import { KpiChartDimensions } from "../data/kpi-chart-dimensions.model";
import { KpiChartScales } from "../axis/kpi-chart-scales.model";


export class KpiChartBand {
  x0Value: number | Date;
  x1Value: number | Date;
  color: string;
  opacity: number;

  constructor(init?: Partial<KpiChartBand>) {
    Object.assign(this, init);
  }

  public apply(bandGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
               dimensions: KpiChartDimensions,
               scales: KpiChartScales): void {
    let x0;
    let x1;

    if (!this.x0Value && !this.x1Value) return;
    if (!this.x0Value) {
      x0 = scales.xMin;
    } else {
      x0 = +this.x0Value <= +scales.xMin ? scales.xMin : this.x0Value;
    }
    if (!this.x1Value) {
      x1 = scales.xMax;
    } else {
      x1 = +this.x1Value >= +scales.xMax ? scales.xMax : this.x1Value;
    }

    if (+x0 === +x1) return;

    bandGroup.selectAll('rect')
      .data([this])
      .join('rect')
        .attr('x', scales.x(x0))
        .attr('y', 0)
        .attr('width', scales.x(x1) - scales.x(x0))
        .attr('height', dimensions.height)
        .style('fill', this.color)
        .style('opacity', this.opacity);
  }
}