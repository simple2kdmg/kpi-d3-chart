import * as d3 from 'd3';
import { IKpiChartGroup } from './kpi-chart-group.interface';
import { KpiChartGroupInfo } from './kpi-chart-group-info.model';
import { KpiChartDatum } from '../data/kpi-chart-datum.model';
import { KpiChartConfig } from '../data/kpi-chart-config.model';
import { KpiChartScales } from '../axis/kpi-chart-scales.model';


export class KpiBarChartGroup implements IKpiChartGroup {
  active: boolean;
  get size(): number { return this.data.length; }
  private barGroup: d3.Selection<d3.BaseType, KpiChartDatum[], SVGGElement, unknown>;
  private barPositions: Array<{x: number, y: number, height: number}>;

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

      if (stackedGroup.data[i] == null) { // corresponding group data is missing
        d.y0Value = 0;
        return;
      }
      // stacked bar is drawn on top of its "stacked" bar, so they should have same sign
      if (stackedGroup.data[i].yValue * d.yValue > 0) {
        d.y0Value = stackedGroup.data[i].yValue;
      }
    });
  }

  public draw(scales: KpiChartScales): void {
    if (!this.data?.length) return;
    this.barPositions = [];
    const yScale = this.info.useSecondaryYAxis ? scales.ySecondary : scales.yPrimary;

    this.barGroup = this.container.selectAll(`g.bar-group-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `bar-group-${this.info.groupOrder}`)
        .attr('transform', `translate(${(this.info.shift - 2) * this.config.barWidth / 4}, 0)` );

    this.barGroup.selectAll('rect')
      .data(this.active ? this.data : [])
      .join('rect') // TODO: check if join is necessary
        .attr('class', (d, i) => `bar-${i}`)
        .style('fill', d => d.color)
        .attr('stroke', '#383838')
        .attr('stroke-width', 0.5)
        .attr('width', this.config.barWidth)
        .attr('height', d => {
          const height = Math.abs(yScale(d.yValue) - yScale(0));
          this.barPositions.push({x: null, y: null, height});
          return height;
        })
        .attr('x', (d, i) => {
          const x = scales.x(d.xValue);
          this.barPositions[i].x = x;
          return x;
        })
        .attr('y', (d, i) => {
          const y = yScale(Math.max(0, d.y0Value ? d.yValue + d.y0Value : d.yValue));
          this.barPositions[i].y = y;
          return y;
        });
  }

  public drawPointReference(): void {
    if (this.info.showYValues) {
      this.drawYValues();
    }
  }

  public onMouseOver(index?: number): void {
    if (!this.active || !this.data?.length) return;
    if (index != null) {
      this.barGroup.select(`rect.bar-${index}`).style('fill', this.data[index]?.brighterColor);
    } else {
      this.barGroup.selectAll('rect').data(this.data).style('fill', d => d.brighterColor);
    }
  }

  public onMouseOut(): void {
    if (!this.active || !this.data?.length) return;
    this.barGroup.selectAll('rect').data(this.data).style('fill', d => d.color);
  }

  private drawYValues(): void {
    if (!this.data?.length) return;
    const yValuesGroup = this.pointReferenceContainer.selectAll(`g.bar-y-values-${this.info.groupOrder}`)
      .data([this.data])
      .join('g')
        .attr('class', `bar-y-values-${this.info.groupOrder}`)
        .attr('transform', `translate(${this.info.shift * this.config.barWidth / 4}, 0)` );

    yValuesGroup.selectAll('text')
      .data(this.active ? this.data : [])
      .join('text')
        //.attr('class', 'bar-y-value')
        .attr('x', (d, i) => this.barPositions[i].x)
        .attr('y', (d, i) => {
          if (d.yValue >= 0) {
            return this.barPositions[i].y - 6;
          } else {
            return this.barPositions[i].y + this.barPositions[i].height + 14;
          }
        })
        .attr('text-anchor', 'middle')
        .attr('fill', d => d.color)
        .text(d => KpiChartDatum.formatYValue(d.yValue, this.config, this.info.useSecondaryYAxis));
  }
}