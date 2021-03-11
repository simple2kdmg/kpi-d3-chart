import * as d3 from 'd3';
import { KpiChartXAxisType } from '../axis/kpi-chart-axis-type.model';
import { KpiChartConfig } from './kpi-chart-config.model';
import { KpiChartValueFormat } from './kpi-chart-value-format.model';

export class KpiChartRequestedDatum {
  groupId: number;
  xNumberValue: number;
  xDateValue: Date;
  yValue: number;
  zValue: number;
  color: string;
  textLabel: string; // TODO
  numericLabel: number; // TODO

  constructor(init: Partial<KpiChartRequestedDatum>) {
    Object.assign(this, init);
  }
}

export class KpiChartDatum extends KpiChartRequestedDatum {
  xValue: number | Date;
  y0Value: number;
  brighterColor: string;

  constructor(init: Partial<KpiChartRequestedDatum>, xAxisType: KpiChartXAxisType) {
    super(init);
    this.xValue = xAxisType === 'date' ? init.xDateValue : init.xNumberValue;
    this.y0Value = null;
    this.color = this.color || '#9bd2cb';
    this.brighterColor = this.brighterColor || d3.rgb(this.color).brighter(0.4).formatRgb();
  }

  public static formatYValue(value: number, config: KpiChartConfig, useSecondaryAxis = false): string {
    const yAxisType = useSecondaryAxis ? config.ySecondaryAxisType : config.yPrimaryAxisType;
    if (yAxisType === 'percent') return d3.format(',%')(value);
    value = KpiChartDatum.applyExponent(value, config.yFormat);
    return d3.format(',')(Math.round(value));
  }

  /**
   * Format Y value and takes in account `tooltipNoFormat` param from the config to be
   * able to ignore formatting value in tooltip.
   */
  public static formatTooltipYValue(value: number, config: KpiChartConfig, useSecondaryAxis = false): string {
    const yAxisType = useSecondaryAxis ? config.ySecondaryAxisType : config.yPrimaryAxisType;
    if (yAxisType === 'percent') return d3.format(',%')(value);
    if (!config.tooltipNoFormat) value = KpiChartDatum.applyExponent(value, config.yFormat);
    return d3.format(',')(Math.round(value));
  }

  public static groupByYear(data: KpiChartDatum[]): { year: number, data: KpiChartDatum[] }[] {
    const map = new Map<number, KpiChartDatum[]>();

    data.forEach(datum => {
      const year = (datum.xDateValue).getFullYear();
      if (map.has(year)) {
        map.get(year).push(datum);
      } else {
        map.set(year, [datum]);
      }
    });

    return [...map.keys()].sort((y1, y2) => y1 - y2).map(year => ({ year, data: map.get(year) }));
  }

  private static applyExponent(value: number, yFormat: KpiChartValueFormat): number {
    switch(yFormat) {
      case 'K':
        return (value as number) / 1000;
      case 'M':
        return (value as number) / 1000000;
      default:
        return value;
    }
  }
}