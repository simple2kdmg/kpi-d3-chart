
import { KpiChartGroupInfo } from '../groups/kpi-chart-group-info.model';
import { KpiChartRequestedDatum } from './kpi-chart-datum.model';

export class KpiChartRequestedInfo {
    groupInfos: KpiChartGroupInfo[];
    allData: KpiChartRequestedDatum[];
}