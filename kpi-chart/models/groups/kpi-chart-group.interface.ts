import * as d3 from 'd3';
import { KpiChartGroupInfo } from './kpi-chart-group-info.model';
import { KpiChartDatum } from '../data/kpi-chart-datum.model';
import { KpiChartScales } from '../axis/kpi-chart-scales.model';


export interface IKpiChartGroup {
  container: d3.Selection<SVGGElement, unknown, null, undefined>;
  pointReferenceContainer: d3.Selection<SVGGElement, unknown, null, undefined>;
  info: KpiChartGroupInfo;
  data: KpiChartDatum[];
  active: boolean;
  size: number;

  draw(scales: KpiChartScales): void;
  drawPointReference(): void;
  onMouseOver(index?: number): void;
  onMouseOut(): void;
  calculateStackedValues(stackedGroup: IKpiChartGroup): void;
}