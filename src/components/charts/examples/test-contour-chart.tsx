'use client';

import * as d3 from 'd3';
import { useCallback } from 'react';
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

import { InlineMath } from 'react-katex';

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: true },
    domainConfig: { domainX: [-1, 1], domainY: [-1, 1] },
    colorConfig: { continuousColorScheme: d3.interpolateRdYlBu },
    axisConfig: { showGrid: false },
    margin: { right: 80 },
};

export default function TestContourChart() {
    const f = useCallback((x: number, y: number) => {
        return Math.cos(2 * Math.PI * x * y) + Math.sin(2 * Math.PI * x + y);
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
                    thresholds={20}
                    // shadeContour={false}
                    strokeColor="none"
                    legendConfig={legendConfig}
                    tooltipConfig={tooltipConfig}
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    A contour plot of the function{' '}
                    <InlineMath math="\cos(2 \pi xy) + \sin(2 \pi x + y))" />.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
