import { KpiChartDatum, KpiChartRequestedDatum } from './kpi-chart-datum.model';
import { KpiChartRequestedInfo } from './kpi-chart-requested-info.model';
import { KpiChartConfig } from './kpi-chart-config.model';
import { KpiChartDimensions } from './kpi-chart-dimensions.model';
import { IKpiChartGroup } from '../groups/kpi-chart-group.interface';
import { KpiChartGroupFactory } from '../groups/kpi-chart-group.factory';


export class KpiChartData {
  all: KpiChartDatum[];
  maxYValue: number;
  chartGroups: IKpiChartGroup[];
  activeGroups: IKpiChartGroup[];
  largestActiveGroup: IKpiChartGroup;
  largestPrimaryActiveGroup: IKpiChartGroup; // group with largest number of points to get tick number (using primary Y axis)
  largestSecondaryActiveGroup: IKpiChartGroup; // group with largest number of points to get tick number (using secondary Y axis)
  primaryActiveGroupsData: KpiChartDatum[]; // to calculate primary axis boundaries
  secondaryActiveGroupsData: KpiChartDatum[]; // to calculate secondary axis boundaries
  private groupFactory: KpiChartGroupFactory;
  private chartGroupsMap: Map<number, IKpiChartGroup>;

  constructor(mainContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
              pointReferenceContainer: d3.Selection<SVGGElement, unknown, null, undefined>,
              private config: KpiChartConfig,
              private dimensions: KpiChartDimensions) {
    this.groupFactory = new KpiChartGroupFactory(mainContainer, pointReferenceContainer, config);
    this.chartGroupsMap = new Map<number, IKpiChartGroup>();
  }

  public update(info: KpiChartRequestedInfo): void {
    this.updateAllData(info.allData);
    this.updateChartGroups(info);
    this.updateActiveGroups();
  }

  public updateActiveGroups(): void {
    this.calculateAllStackedValues();
    this.distributeActiveGroups();
  }

  public adjustBarWidth(): void {
    const nonstackedBarChartsCount = this.chartGroups.filter(g => !g.info.stackedGroupId && g.info.groupType == 'column').length;
    if (nonstackedBarChartsCount === 0) return;
    // Date scale have 2 extra ticks, therefore tick count increased by 2
    const dateScaleCorrection = this.config.xAxisType === 'date' ? 2 : 0;
    const tickIntervalsCount = this.largestActiveGroup.size + dateScaleCorrection - 1;
    const availableBarWidth = 0.7 * this.dimensions.width / tickIntervalsCount / nonstackedBarChartsCount;
    if (availableBarWidth > 25) {
      this.config.barWidth = 25;
    } else if (availableBarWidth < 10) {
      this.config.barWidth = 10;
    } else {
      this.config.barWidth = availableBarWidth;
    }
  }

  private updateAllData(allData: KpiChartRequestedDatum[]): void {
    this.maxYValue = allData[0]?.yValue;
    this.all = allData
      .sort((d1, d2) => +d1.xNumberValue - +d2.xNumberValue)
      .map(reqDatum => {
        this.maxYValue = reqDatum.yValue > this.maxYValue ? reqDatum.yValue : this.maxYValue;
        return new KpiChartDatum(reqDatum, this.config.xAxisType)
      });
  }

  private updateChartGroups(info: KpiChartRequestedInfo): void {
    const chartGroupsData = new Map<number, KpiChartDatum[]>();
    const nextChartGroupsMap = new Map<number, IKpiChartGroup>();

    this.all.forEach(d => { // distributing data between groups
      if (chartGroupsData.has(d.groupId)) {
        chartGroupsData.get(d.groupId).push(d);
      } else {
        chartGroupsData.set(d.groupId, [d]);
      }
    });

    this.chartGroups = info.groupInfos.map(i => {
      let group: IKpiChartGroup;
      let groupData = chartGroupsData.get(i.groupId);
      if (!groupData) {
        throw new Error(`There are no data for chart group [${i.groupName}] with Id = ${i.groupId}.`);
      }

      if (this.chartGroupsMap.has(i.groupId)) { // update group
        group = this.chartGroupsMap.get(i.groupId);
        Object.assign(group.info, i);
        group.data = groupData;
      } else { // create group
        group = this.groupFactory.create(i, groupData);
        group.active = true;
      }

      nextChartGroupsMap.set(i.groupId, group);
      return group;
    }).sort((g1, g2) => g1.info.groupOrder - g2.info.groupOrder);

    this.chartGroupsMap = nextChartGroupsMap;
  }

  private calculateAllStackedValues(): void {
    this.chartGroups.forEach((group, i, all) => {
      const stackedGroup = group.info.stackedGroupId ?
        all.find(g => g.info.groupId === group.info.stackedGroupId) : null;
      group.calculateStackedValues(stackedGroup);
    });
  }

  private distributeActiveGroups(): void {
    const allActiveGroups = [];
    const primaryActiveGroups = [];
    const secondaryActiveGroups = [];
    let maxPrimaryGroupSize = 0;
    let maxSecondaryGroupSize = 0;

    this.chartGroups.forEach(g => {
      if (!g.active) {
        return;
      } else if (!g.info.useSecondaryYAxis) {
        primaryActiveGroups.push(g);
        if (g.size > maxPrimaryGroupSize) {
          maxPrimaryGroupSize = g.size;
          this.largestPrimaryActiveGroup = g;
        }
      } else {
        secondaryActiveGroups.push(g);
        if (g.size > maxSecondaryGroupSize) {
          maxSecondaryGroupSize = g.size;
          this.largestSecondaryActiveGroup = g;
        }
      }
      allActiveGroups.push(g);
    });

    this.activeGroups = allActiveGroups;

    if (!this.largestSecondaryActiveGroup) {
      this.largestActiveGroup = this.largestPrimaryActiveGroup;
    } else {
      this.largestActiveGroup = this.largestPrimaryActiveGroup.size > this.largestSecondaryActiveGroup.size ?
        this.largestPrimaryActiveGroup : this.largestSecondaryActiveGroup;
    }

    this.primaryActiveGroupsData = primaryActiveGroups.flatMap(g => g.data);
    this.secondaryActiveGroupsData = secondaryActiveGroups.flatMap(g => g.data);
  }
}