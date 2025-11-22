'use client';

import * as d3 from 'd3';
import { useCallback, useEffect, useState } from 'react';
import BaseContourPlot from '@/components/plots/templates/contour-plot';
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
    themeConfig: { enableZoom: true },
    domainConfig: { domainX: [-1.0, 1.0], domainY: [-1.0, 1.0] },
    colorConfig: {continuousColorScheme: d3.interpolateRdYlBu},
    // axisConfig: {tickCount: 10},
    // scaleConfig: {logY: true},
    margin: {right: 80}
};

export default function TestContourChart() {
    const f = useCallback((x: number, y: number) => {
        return Math.cos(5 * x * y) + Math.sin(5 * x + y)
    }, []);
    const { legendRef, legendConfig } = useChartLegend();
    const { tooltipRef, tooltipConfig } = useChartTooltip();

    return (
        <ChartLayout>
            <ChartPlotWrapper>
                <ChartLegend ref={legendRef} />
                <ChartTooltip ref={tooltipRef} />
                <BaseContourPlot
                    func={f}
                    thresholds={50}
                    // shadeContour={false}
                    legendConfig={legendConfig}
                    tooltipConfig={tooltipConfig}
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    A scatter plot of the iris dataset. Hover over the points
                    for more info.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
