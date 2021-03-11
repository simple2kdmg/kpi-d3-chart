import { KpiChartMargin } from "./kpi-chart-margin.model";
import { KpiChartXAxisType, KpiChartYAxisType, KpiChartZAxisType } from "../axis/kpi-chart-axis-type.model";
import { KpiChartValueFormat } from './kpi-chart-value-format.model';


export class KpiChartRequestedConfig {
    containerWidth: number;
    containerHeight: number;
    xAxisType: KpiChartXAxisType; // DB string
    xAxisMinNumberValue: number;
    xAxisMinDateValue: Date;
    xAxisStep: number; // default is 1
    groupByYear: boolean;
    yPrimaryAxisType: KpiChartYAxisType; // DB string
    ySecondaryAxisType: KpiChartYAxisType; // DB string
    yAxisMinValue: number;
    yFormat: KpiChartValueFormat; // DB string
    zAxisType: KpiChartZAxisType; // DB string
    hasLegend: boolean;
    hasTooltips: boolean;
    tooltipNoFormat: boolean;
    xTicksOff: boolean;
    yTicksOff: boolean;
    canvasMode: boolean;
}

/**
 * @params `containerWidth`, `containerHeight`, `barWidth`, `margin`,
 * `xAxisType`, `yAxisType`, `groupByYear`, `xAxisMinNumberValue`, `xAxisMinDateValue`,
 * `xAxisStep`, `yAxisMinValue`, `yFormat`, `hasLegend`, `hasTooltips`, `tooltipNoExponent`
 *  @xAxisType 'numeric' | 'date'
    @yPrimaryAxisType 'numeric' | 'percent'
    @ySecondaryAxisType 'numeric' | 'percent'
    @tooltipNoFormat if true, yFormat param doesnt apply on tooltip values
 */
export class KpiChartConfig extends KpiChartRequestedConfig {
    barWidth: number;

    constructor(requestedConfig: Partial<KpiChartRequestedConfig>) {
        super();
        this.update(requestedConfig);
        this.xAxisStep = this.xAxisStep || 1;
        this.barWidth = null;
    }

    public update(requestedConfig: Partial<KpiChartRequestedConfig>): void {
        Object.assign(this, requestedConfig);
    }
}