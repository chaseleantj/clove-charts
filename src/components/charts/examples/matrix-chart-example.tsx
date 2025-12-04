'use client';

import * as d3 from 'd3';
import MatrixPlot from '../../plots/templates/matrix-plot';
import { PlotConfig } from '../../plots/common/config';
import {
    ChartLayout,
    ChartFooter,
    ChartCaptions,
} from '../chart-layout';

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: false, opacity: 0.9 },
    colorConfig: { continuousColorScheme: d3.interpolatePuBu },
    axisConfig: { showGrid: false, showAxis: true, xLabel: 'X', yLabel: 'Y' },
    legendConfig: {
        enabled: true,
        title: 'Values',
    },
    tooltipConfig: {
        enabled: true,
    },
};

const xLabels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'];
const yLabels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'];
const data: Record<string, any>[] = [];
for (const x of xLabels) {
    for (const y of yLabels) {
        data.push({
            xCol: x,
            yCol: y,
            value: Math.random(),
        });
    }
}

export default function MatrixChartExample() {
    return (
        <ChartLayout>
            <MatrixPlot
                data={data}
                xKey="xCol"
                yKey="yCol"
                valueKey="value"
                {...PLOT_CONFIG}
            />
            <ChartFooter>
                <ChartCaptions>A random matrix plot example.</ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
