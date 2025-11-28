'use client';

import * as d3 from 'd3';
import { useEffect, useState, useMemo } from 'react';
import BaseBarPlot from '@/components/plots/templates/bar-plot';
import { PlotConfig } from '@/components/plots/common/config';
import { ChartLayout } from '@/components/charts/chart-layout';

interface IrisData {
    sepal_length: number;
    sepal_width: number;
    petal_length: number;
    petal_width: number;
    species: string;
}

const PLOT_CONFIG: PlotConfig = {
    axisConfig: { xLabel: 'Species', yLabel: 'Frequency' },
};

export default function IrisBarChart() {
    const [irisData, setIrisData] = useState<IrisData[]>([]);
    const irisSpeciesCounts = useMemo(
        () =>
            Array.from(
                d3.group(irisData, (d) => d.species),
                ([species, items]) => ({ species, count: items.length })
            ),
        [irisData]
    );

    useEffect(() => {
        d3.csv('/data/iris.csv', d3.autoType).then((data) => {
            setIrisData(data as IrisData[]);
        });
    }, []);

    return (
        <ChartLayout>
            <BaseBarPlot
                data={irisSpeciesCounts}
                xKey="species"
                yKey="count"
                padding={0.4}
                useDifferentColors={true}
                {...PLOT_CONFIG}
            />
        </ChartLayout>
    );
}
