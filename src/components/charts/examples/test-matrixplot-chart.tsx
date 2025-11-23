'use client';

import * as d3 from 'd3';
import BaseMatrixPlot from '@/components/plots/templates/matrix-plot';
import { PlotConfig } from '@/components/plots/common/config';
import {
    ChartLayout,
    ChartPlotWrapper,
    ChartLegend,
    ChartTooltip,
    ChartFooter,
    ChartCaptions,
    useChartLegend,
    useChartTooltip,
} from '@/components/charts/chart-layout';

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: false, opacity: 0.9 },
    colorConfig: { continuousColorScheme: d3.interpolatePuBu },
    axisConfig: { showGrid: false, showAxis: true },
    margin: { left: 80, right: 80 },
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

export default function TestMatrixPlotChart() {
    const { legendRef, legendConfig } = useChartLegend({title: "Values"});
    const { tooltipRef, tooltipConfig } = useChartTooltip();

    return (
        <ChartLayout>
            <ChartPlotWrapper>
                <ChartLegend ref={legendRef} />
                <ChartTooltip ref={tooltipRef} />
                <BaseMatrixPlot
                    data={data}
                    xClass="xCol"
                    yClass="yCol"
                    valueClass="value"
                    legendConfig={legendConfig}
                    tooltipConfig={tooltipConfig}
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    A random matrix plot example.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}

