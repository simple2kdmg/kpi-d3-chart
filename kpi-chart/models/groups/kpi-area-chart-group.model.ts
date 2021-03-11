import * as d3 from 'd3';
import { KpiChartDatum } from '../data/kpi-chart-datum.model';
import { KpiChartGroupInfo } from './kpi-chart-group-info.model';
import { IKpiChartGroup } from './kpi-chart-group.interface';
import { KpiChartScales } from '../axis/kpi-chart-scales.model';
import { KpiChartConfig } from '../data/kpi-chart-config.model';


export class KpiAreaChartGroup implements IKpiChartGroup {
  active: boolean;
  get size(): number { return this.data.length; }
  private areaGroup: d3.Selection<d3.BaseType, KpiChartDatum[], SVGGElement, unknown>;
  private pointReferenceGroup: d3.Selection<d3.BaseType, KpiChartDatum[], SVGGElement, unknown>;
  private pointPositions: Array<{x: number, y0: number, y1: number}>;

  constructor(public container: d3.Selection<SVGGElement, unknown, null, undefined>,
              public pointReferenceContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
              public info: KpiChartGroupInfo,
              public data: KpiChartDatum[],
              private config: KpiChartConfig) {
    this.active = true;
  }

  public calculateStackedValues(stackedGroup: IKpiChartGroup): void {
    if (!stackedGroup) return;

    this.data.forEach((d, i) => {
      if (!stackedGroup.active) {
        d.y0Value = null;
        return;
      }
      d.y0Value = stackedGroup.data[i].yValue;
    });
  }

  public draw(scales: KpiChartScales): void {
    if (!this.data?.length) return;
    this.pointPositions = [];
    const area = d3.area<KpiChartDatum>().x( d => {
      const x = scales.x(d.xValue);
      this.pointPositions.push({x, y0: null, y1: null});
      return x;
    });
    const yScale = this.info.useSecondaryYAxis ? scales.ySecondary : scales.yPrimary;

    area.y0( (d, i) => {
          const y0 = yScale(d.y0Value ?? 0);
          this.pointPositions[i].y0 = y0;
          return y0;
        })
        .y1( (d, i) => {
          const y1 = yScale(d.y0Value ? d.yValue + d.y0Value : d.yValue);
          this.pointPositions[i].y1 = y1;
          return y1;
        });

    this.areaGroup = this.container.selectAll(`g.area-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `area-${this.info.groupOrder}`);

    this.areaGroup.selectAll('path')
      .data([this.active ? this.data : []])
      .join('path')
        .attr('fill', this.data[0].color)
        .attr('d', area);
  }

  public drawPointReference(): void {
    if (!this.data?.length) return;
    this.pointReferenceGroup = this.pointReferenceContainer.selectAll(`g.area-points-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `area-points-${this.info.groupOrder}`);

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
        .attr('cy', (d, i) => this.pointPositions[i].y1);
  }

  public onMouseOver(index?: number): void {
    if (!this.active || !this.data?.length) return;
    if (index != null) {
      this.pointReferenceGroup.select(`circle.point-${index}`).style('display', null);
    } else {
      this.areaGroup.selectAll('path').attr('fill', this.data[0].brighterColor);
      this.pointReferenceGroup.selectAll('circle').style('display', null);
    }
  }

  public onMouseOut(): void {
    if (!this.active || !this.data?.length) return;
    this.areaGroup.selectAll('path').attr('fill', this.data[0].color);
    this.pointReferenceGroup.selectAll('circle').style('display', 'none');
  }
}