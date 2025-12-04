'use client';

import * as d3 from 'd3';
import { useCallback } from 'react';
import ContourPlot from '../../plots/templates/contour-plot';
import { PlotConfig } from '../../plots/common/config';
import { ChartLayout, ChartFooter, ChartCaptions } from '../chart-layout';

import { InlineMath } from 'react-katex';

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: true },
    domainConfig: { domainX: [-1, 1], domainY: [-1, 1] },
    colorConfig: { continuousColorScheme: d3.interpolateRdYlBu },
    axisConfig: { showGridX: false, showGridY: false },
    legendConfig: {
        enabled: true,
    },
    tooltipConfig: {
        enabled: false,
    },
};

const f = (x: number, y: number) => {
    return Math.cos(2 * Math.PI * x * y) + Math.sin(2 * Math.PI * x + y);
};

export default function ContourChartExample() {
    return (
        <ChartLayout>
            <ContourPlot
                func={f}
                thresholds={20}
                strokeColor="none"
                {...PLOT_CONFIG}
            />
            <ChartFooter>
                <ChartCaptions>
                    A contour plot of the function{' '}
                    <InlineMath math="\cos(2 \pi xy) + \sin(2 \pi x + y))" />.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
