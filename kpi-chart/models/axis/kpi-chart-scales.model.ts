import * as d3 from 'd3';
import { KpiChartData } from '../data/kpi-chart-data.model';
import { KpiChartConfig } from '../data/kpi-chart-config.model';
import { KpiChartDimensions } from '../data/kpi-chart-dimensions.model';


export class KpiChartScales {
  x: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;
  yPrimary: d3.ScaleLinear<number, number>;
  ySecondary: d3.ScaleLinear<number, number>;
  z: d3.ScaleLinear<number, number>;
  xMin: number | Date
  xMax: number | Date;
  yPrimaryMin: number;
  yPrimaryMax: number;
  ySecondaryMin: number;
  ySecondaryMax: number;
  zMin: number;
  zMax: number;
  private chartData: KpiChartData;

  constructor(private config: KpiChartConfig, private dimensions: KpiChartDimensions) {
    
  }

  public appendData(chartData: KpiChartData): void {
    this.chartData = chartData;
  }

  public update(): void {
    if (this.config.xAxisType === 'numeric') {
      this.setXNumberScale();
    } else if (this.config.xAxisType === 'date') {
      this.setXDateScale();
    }

    if (this.config.yPrimaryAxisType == null) {
      throw new Error('yPrimaryAxisType can not be null or udefined');
    }

    this.setYPrimaryScale();

    if (this.config.ySecondaryAxisType) {
      this.setYSecondaryScale();
    }
  }

  private setXDateScale(): void {
    if (this.config.xAxisMinDateValue) {
      this.xMin = this.config.xAxisMinDateValue;
    } else {
      this.xMin = new Date(d3.min( this.chartData.primaryActiveGroupsData, d => d.xDateValue ));
      this.xMin.setMonth(this.xMin.getMonth() - 1);
    }
    
    this.xMax = new Date(d3.max( this.chartData.primaryActiveGroupsData, d => d.xDateValue ));
    this.xMax.setMonth(this.xMax.getMonth() + 1);

    this.x = d3.scaleTime()
      .domain([this.xMin, this.xMax])
      .range([0, this.dimensions.width]);
  }

  private setXNumberScale(): void {
    this.xMin = this.config.xAxisMinNumberValue ?? d3.min( this.chartData.primaryActiveGroupsData, d => d.xNumberValue );
    this.xMax = d3.max( this.chartData.primaryActiveGroupsData, d => d.xNumberValue );

    this.x = d3.scaleLinear()
      .domain([this.xMin, this.xMax])
      .nice()
      .range([0, this.dimensions.width]);
  }

  private setYPrimaryScale(): void {
    this.yPrimaryMin = this.config.yAxisMinValue ?? d3.min( this.chartData.primaryActiveGroupsData, d => d.yValue );
    this.yPrimaryMax = d3.max( this.chartData.primaryActiveGroupsData, d => d.y0Value ? d.y0Value + d.yValue : d.yValue );

    if (this.chartData.largestPrimaryActiveGroup.info.groupType !== 'line' && this.yPrimaryMin > 0) {
      this.yPrimaryMin = 0;
    }

    this.yPrimary = d3.scaleLinear()
      .domain([this.yPrimaryMin, this.yPrimaryMax])
      .nice()
      .range([this.dimensions.height, 0]);
  }

  private setYSecondaryScale(): void {
    this.ySecondaryMin = this.config.yAxisMinValue ?? d3.min( this.chartData.secondaryActiveGroupsData, d => d.yValue );
    this.ySecondaryMax = d3.max( this.chartData.primaryActiveGroupsData, d => d.y0Value ? d.y0Value + d.yValue : d.yValue );

    if (this.chartData.largestSecondaryActiveGroup.info.groupType !== 'line' && this.ySecondaryMin > 0) {
      this.ySecondaryMin = 0;
    }

    this.ySecondary = d3.scaleLinear()
      .domain([this.ySecondaryMin, this.ySecondaryMax])
      .nice()
      .range([this.dimensions.height, 0]);
  }

}