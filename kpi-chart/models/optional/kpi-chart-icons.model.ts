import * as d3 from 'd3';
import { KpiChartType } from '../data/kpi-chart-type.model';


export function appendIcon(selection: d3.Selection<SVGGElement, unknown, null, undefined>,
                           type: KpiChartType,
                           color: string): d3.Selection<SVGGElement, unknown, null, undefined> {
    const group = selection.append('g').attr('transform', 'translate(0, -15)');
    group.append('path').attr('d', 'M0.985 1.018 L 0.985 18.025').attr('stroke', color).attr('stroke-width', 2).attr('stroke-linecap', 'square');
    group.append('path').attr('d', 'M0.985 18.025 L 17.993 18.025').attr('stroke', color).attr('stroke-width', 2).attr('stroke-linecap', 'square');

    switch(type) {
        case 'area':
            group.append('path').attr('d', 'M17.993 1.018 L 12.979 8.514 7.97 4.554 2.956 10.379 2.956 16.01 17.993 16.01Z').attr('fill', color);
            break;
        case 'column':
            group.append('rect').attr('x', 3.056).attr('y', 6.495).attr('width', 3.068).attr('height', 9.548).attr('fill', color);
            group.append('rect').attr('x', 6.983).attr('y', 3.872).attr('width', 3.068).attr('height', 12.172).attr('fill', color);
            group.append('rect').attr('x', 10.911).attr('y', 1.032).attr('width', 3.068).attr('height', 15.011).attr('fill', color);
            group.append('rect').attr('x', 14.838).attr('y', 5.604).attr('width', 3.068).attr('height', 10.439).attr('fill', color);
            break;
        case 'line':
            group.append('path').attr('d', 'M17.993 3.018 L 12.979 11.514 7.97 6.554 2.956 12.379').attr('stroke', color).attr('stroke-width', 1.5).attr('fill', 'none');
            break;
    }

    return selection;
}
