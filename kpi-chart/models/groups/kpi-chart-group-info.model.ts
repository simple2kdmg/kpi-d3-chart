import { KpiChartType } from "../data/kpi-chart-type.model";
import { KpiChartLabelType } from "../data/kpi-chart-label-type.model";

export class KpiChartGroupInfo {
  groupId: number;
  groupName: string;
  groupType: KpiChartType; // DB string
  groupOrder: number;
  useSecondaryYAxis: boolean;
  stackedGroupId: number;
  shift: number;
  showYValues: boolean;
  labelType: KpiChartLabelType;
  currency?: string;
}