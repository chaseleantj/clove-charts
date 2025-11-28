'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import ScatterPlot from '@/components/plots/templates/scatter-plot';
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
    themeConfig: { enableZoom: false },
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
};

export default function ScatterChartExample() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);

    useEffect(() => {
        d3.csv('/data/iris.csv', d3.autoType).then((data) => {
            setIrisData(data as IrisData[]);
        });
    }, []);

    return (
        <ChartLayout>
            <ScatterPlot
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
