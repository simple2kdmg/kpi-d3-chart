import * as d3 from 'd3';
import { KpiChartGroupInfo } from './kpi-chart-group-info.model';
import { IKpiChartGroup } from './kpi-chart-group.interface';
import { KpiChartDatum } from '../data/kpi-chart-datum.model';
import { KpiChartConfig } from '../data/kpi-chart-config.model';
import { KpiChartScales } from '../axis/kpi-chart-scales.model';


export class KpiLineChartGroup implements IKpiChartGroup {
  active: boolean;
  get size(): number { return this.data.length; }
  private lineGroup: d3.Selection<d3.BaseType, KpiChartDatum[], SVGGElement, unknown>;
  private pointReferenceGroup: d3.Selection<d3.BaseType, KpiChartDatum[], SVGGElement, unknown>;
  private pointPositions: Array<{x: number, y: number}>;

  constructor(public container: d3.Selection<SVGGElement, unknown, null, undefined>,
              public pointReferenceContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
              public info: KpiChartGroupInfo,
              public data: KpiChartDatum[],
              private config: KpiChartConfig) {
    this.active = true;
  }

  public calculateStackedValues(stackedGroup: IKpiChartGroup): void { }

  public draw(scales: KpiChartScales): void {
    if (!this.data?.length) return;
    const yScale = this.info.useSecondaryYAxis ? scales.ySecondary : scales.yPrimary;

    this.lineGroup = this.container.selectAll(`g.line-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `line-${this.info.groupOrder}`);

    this.lineGroup.select('path')
      .data([this.active ? this.data : []])
      .join('path')
        .attr("fill", "none")
        .attr("stroke", this.data[0].color)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<KpiChartDatum>()
          .x((d, i) => {
            const x = scales.x(d.xValue);
            this.pointPositions.push({x, y: null});
            return x;
          })
          .y((d, i) => {
            const y = yScale(d.yValue);
            this.pointPositions[i].y = y;
            return y;
          })
        );
  }

  public drawPointReference(): void {
    if (!this.data?.length) return;
    this.pointReferenceGroup = this.pointReferenceContainer.selectAll(`g.line-points-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `line-points-${this.info.groupOrder}`);

    this.pointReferenceGroup.selectAll('circle')
      .data(this.active ? this.data : [])
      .join('circle')
        .style('display', 'none')
        .attr('class', (d, i) => `point-${i}`)
        .attr('r', 5)
        .attr('fill', d => d.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('cx', (d, i) => this.pointPositions[i].x)
        .attr('cy', (d, i) => this.pointPositions[i].y);

    if (this.info.showYValues) {
      this.drawYValues();
    }
  }

  public onMouseOver(index?: number): void {
    if (!this.active || !this.data?.length) return;
    if (index != null) {
      this.pointReferenceGroup.select(`circle.point-${index}`).style('display', null);
    } else {
      this.lineGroup.selectAll('path').attr('fill', this.data[0].brighterColor);
      this.pointReferenceGroup.selectAll('circle').style('display', null);
    }
  }

  public onMouseOut(): void {
    if (!this.active || !this.data?.length) return;
    this.lineGroup.selectAll('path').attr('fill', this.data[0].color);
    this.pointReferenceGroup.selectAll('circle').style('display', 'none');
  }

  private drawYValues(): void {
    if (!this.data?.length) return;
    const yValuesGroup = this.pointReferenceContainer.selectAll(`g.line-y-values-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `line-y-values-${this.info.groupOrder}`);

    yValuesGroup.selectAll('text')
      .data(this.active ? this.data : [])
      .join('text')
        //.attr('class', 'line-y-value')
        .attr('x', (d, i) => this.pointPositions[i].x)
        .attr('y', (d, i) => this.pointPositions[i].y - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', d => d.yValue > 0 ? '#22a98e' : 'red')
        .text(d => KpiChartDatum.formatYValue(d.yValue, this.config, this.info.useSecondaryYAxis));
  }
}