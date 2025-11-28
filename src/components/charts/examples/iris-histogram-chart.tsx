'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseHistogramPlot from '@/components/plots/templates/histogram-plot';
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
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Frequency' },
    legendConfig: {
        enabled: false,
    },
    tooltipConfig: {
        enabled: false,
    },
};

export default function IrisHistogramChart() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);

    useEffect(() => {
        d3.csv('/data/iris.csv', d3.autoType).then((data) => {
            setIrisData(data as IrisData[]);
        });
    }, []);

    return (
        <ChartLayout>
            <BaseHistogramPlot
                data={irisData}
                xKey="sepal_width"
                {...PLOT_CONFIG}
            />
            <ChartFooter>
                <ChartCaptions>
                    A histogram plot of the iris dataset.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
