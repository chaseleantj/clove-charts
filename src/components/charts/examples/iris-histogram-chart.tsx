'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseHistogramPlot from '@/components/plots/templates/histogram-plot';
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

interface IrisData {
    sepal_length: number;
    sepal_width: number;
    petal_length: number;
    petal_width: number;
    species: string;
}

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: true },
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Frequency' },
};

export default function IrisHistogramChart() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);
    const { legendRef, legendConfig } = useChartLegend();
    const { tooltipRef, tooltipConfig } = useChartTooltip();

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv(
                    '/data/iris.csv',
                    d3.autoType
                ).then((data) => {
                    setIrisData(data as IrisData[]);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setIrisData([]);
            }
        }
        fetchData();
    }, []);

    return (
        <ChartLayout>
            <ChartPlotWrapper>
                <ChartLegend ref={legendRef} />
                <ChartTooltip ref={tooltipRef} />
                <BaseHistogramPlot
                    data={irisData}
                    xClass="sepal_width"
                    numBins={10}
                    legendConfig={legendConfig}
                    tooltipConfig={tooltipConfig}
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    A histogram plot of the iris dataset.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
