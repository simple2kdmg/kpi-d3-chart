import { KpiChartDatum } from "./kpi-chart-datum.model";
import { KpiChartConfig } from "./kpi-chart-config.model";

export class KpiChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;

  constructor() {
    this.top = 10;
    this.right = 10;
    this.bottom = 40;
    this.left = 40;
  }

  public adjustLeft(maxYValue: number, config: KpiChartConfig): void {
    this.left = KpiChartDatum.formatYValue(maxYValue, config).length * 8 + 20;
  }
}