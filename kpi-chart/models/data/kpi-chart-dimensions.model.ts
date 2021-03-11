import { KpiChartConfig } from "./kpi-chart-config.model";
import { KpiChartMargin } from "./kpi-chart-margin.model";

export class KpiChartDimensions {
  margin: KpiChartMargin;
  containerWidth: number;
  containerHeight: number;
  width: number;
  height: number;

  constructor(private container: HTMLDivElement ,
              private config: KpiChartConfig) {
    this.margin = new KpiChartMargin();
    if (this.config.hasLegend) this.margin.bottom += 30;
  }

  public update(maxYValue: number): void {
    this.containerWidth = this.config.containerWidth || this.container.offsetWidth;
    this.containerHeight = this.config.containerHeight || this.container.offsetHeight;
    this.margin.adjustLeft(maxYValue, this.config);
    this.width = this.containerWidth - this.margin.left - this.margin.right;
    this.height = this.containerHeight - this.margin.top - this.margin.bottom;
  }
}