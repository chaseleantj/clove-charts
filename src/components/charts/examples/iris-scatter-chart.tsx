'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseScatterPlot from '@/components/plots/templates/scatter-plot';
import { PlotConfig } from '@/components/plots/common/config';
import {
    ChartLayout,
    ChartFooter,
    ChartCaptions,
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
    axisConfig: {
        xLabel: 'Sepal width (cm)',
        yLabel: 'Petal length (cm)',
    },
    legendConfig: {
        enabled: true,
        title: 'Species',
    },
    tooltipConfig: {
        enabled: true,
    },
    margin: { right: 100 },
};

export default function IrisScatterChart() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv('/data/iris.csv', d3.autoType).then((data) => {
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
            <BaseScatterPlot
                data={irisData}
                xKey="petal_width"
                yKey="sepal_length"
                colorKey="species"
                {...PLOT_CONFIG}
            />
            <ChartFooter>
                <ChartCaptions>
                    A scatter plot of the iris dataset. Hover over the points
                    for more info.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
