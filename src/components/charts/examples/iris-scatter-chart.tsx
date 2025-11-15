'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseScatterPlot from '@/components/plots/templates/scatter-plot';
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
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Petal length (cm)' },
    margin: { right: 55 },
};

export default function IrisScatterChart() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);
    const { legendRef, legendConfig } = useChartLegend();
    const { tooltipRef, tooltipConfig } = useChartTooltip();

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv(
                    'https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv',
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
                <BaseScatterPlot
                    data={irisData}
                    xClass="sepal_width"
                    yClass="petal_length"
                    colorByClass="species"
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
