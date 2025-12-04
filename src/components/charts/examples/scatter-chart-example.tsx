'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import ScatterPlot from '../../plots/templates/scatter-plot';
import { PlotConfig } from '../../plots/common/config';
import { ChartLayout, ChartFooter, ChartCaptions } from '../chart-layout';

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
        tooltipKeys: [
            'species',
            'sepal_length',
            'sepal_width',
            'petal_length',
            'petal_width',
        ],
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
