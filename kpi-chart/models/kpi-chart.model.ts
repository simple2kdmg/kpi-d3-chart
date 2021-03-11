import * as d3 from 'd3';
import { KpiChartConfig, KpiChartRequestedConfig } from "./data/kpi-chart-config.model";
import { KpiChartBand } from './optional/kpi-chart-band.model';
import { KpiChartDimensions } from './data/kpi-chart-dimensions.model';
import { KpiChartData } from './data/kpi-chart-data.model';
import { KpiChartAxis } from './axis/kpi-chart-axis.model';
import { KpiChartLegend } from './optional/kpi-chart-legend.model';
import { KpiChartTooltip } from './optional/kpi-chart-tooltip.model';
import { KpiChartRequestedInfo } from './data/kpi-chart-requested-info.model';


export class KpiChart {
  private config: KpiChartConfig;
  private svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private canvasSelection: d3.Selection<HTMLCanvasElement, unknown, null, undefined>;
  private dimensions: KpiChartDimensions;
  private chartData: KpiChartData;
  private band: KpiChartBand;
  private axis: KpiChartAxis;
  private legend: KpiChartLegend;
  private tooltip: KpiChartTooltip;
  private bandSelection: d3.Selection<SVGGElement, unknown, null, undefined>;
  private mainSelection: d3.Selection<SVGGElement, unknown, null, undefined>;
  private pointReferenceContainer: d3.Selection<SVGGElement, unknown, null, undefined>;
  private resizeTimer: ReturnType<typeof setTimeout>;

  constructor(private container: HTMLDivElement) {
    this.drawChart = this.drawChart.bind(this);
    this.onLegendClick = this.onLegendClick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  public updateConfig(requestedConfig: KpiChartRequestedConfig): void {
    if (this.config) {
      this.config.update(requestedConfig);
    } else {
      this.config = new KpiChartConfig(requestedConfig);
    }
  }

  public startListenToResizeEvent(): void {
    window.addEventListener('resize', this.onResize);
  }

  public stopListenToResizeEvent(): void {
    window.removeEventListener('resize', this.onResize);
  }

  public updateChartInfo(info: KpiChartRequestedInfo): void {
    if (!this.chartData) this.init();
    this.chartData.update(info);
    this.updateDimensions();
    this.chartData.adjustBarWidth();
    this.drawChart();
  }

  public setBand(band: KpiChartBand): void {
    this.band = band;
  }

  private init(): void {
    this.dimensions = new KpiChartDimensions(this.container, this.config);
    this.initCommonSelections(this.container);
    this.chartData = new KpiChartData(this.mainSelection, this.pointReferenceContainer, this.config, this.dimensions);
    this.axis.appendData(this.chartData);
    this.initOptionalSelections(this.container);
  }

  private drawChart(): void {
    this.axis.draw();
    this.chartData.chartGroups.forEach(g => g.draw(this.axis.scales));
    this.chartData.chartGroups.forEach(g => g.drawPointReference());
    this.band?.apply(this.bandSelection, this.dimensions, this.axis.scales);
    this.legend?.drawLegend();
    this.tooltip?.updateTooltip();
    if (this.config.canvasMode) this.svgToCanvas();
  }

  private onLegendClick(): void {
    if (this.chartData.chartGroups.every(g => !g.active)) {
      this.legend.markAllActive(); // if toggle last active group inactive, all groups are marked active instead
    }
    this.chartData.updateActiveGroups();
    this.axis.draw();
    this.chartData.chartGroups.forEach(g => g.draw(this.axis.scales));
    this.chartData.chartGroups.forEach(g => g.drawPointReference());
  }

  private onResize(): void {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.updateDimensions();
      this.chartData.adjustBarWidth();
      this.drawChart();
    }, 500);
  }

  private initCommonSelections(container: HTMLDivElement): void {
    this.svgSelection = d3.select(container).append('svg').attr("xmlns", "http://www.w3.org/2000/svg");
    this.bandSelection = this.svgSelection.append('g').attr('class', 'band');
    this.axis = new KpiChartAxis(this.svgSelection, this.config, this.dimensions);
    this.mainSelection = this.svgSelection.append('g').attr('class', 'charts');
    this.pointReferenceContainer = this.svgSelection.append('g').attr('class', 'chart-points');
  }

  private initOptionalSelections(container: HTMLDivElement): void {
    if (this.config.hasLegend) {
      this.legend = new KpiChartLegend(this.svgSelection, this.config, this.dimensions, this.chartData, this.onLegendClick);
    }
    if (this.config.hasTooltips) {
      this.tooltip = new KpiChartTooltip(this.svgSelection, container, this.config, this.dimensions, this.chartData, this.axis.scales);
    }
    if (this.config.canvasMode) {
      this.canvasSelection = d3.select(container).append('canvas');
    }
  }

  private updateDimensions(): void {
    this.dimensions.update(this.chartData.maxYValue);
    this.svgSelection.attr('width', this.dimensions.containerWidth)
                     .attr('height', this.dimensions.containerHeight);
    this.canvasSelection?.attr('width', this.dimensions.containerWidth)
                        .attr('height', this.dimensions.containerHeight);
    this.bandSelection.attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);
    this.mainSelection.attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);
    this.pointReferenceContainer.attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);

  }

  private svgToCanvas() {
    const context = this.canvasSelection.node().getContext('2d');
    const svgString = this.domNodeToString(this.svgSelection.node());
    const image = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(svgBlob);

    image.onload = function() {
      context.drawImage(image, 0, 0);
      window.URL.revokeObjectURL(url);
    }

    image.src = url;
  }

  private domNodeToString(domNode) {
    const element = document.createElement('div');
    element.appendChild(domNode);
    return element.innerHTML;
  }
}