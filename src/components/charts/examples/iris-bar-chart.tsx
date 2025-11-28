'use client';

import BaseBarPlot from '@/components/plots/templates/bar-plot';
import { PlotConfig } from '@/components/plots/common/config';
import { ChartLayout } from '@/components/charts/chart-layout';

const PLOT_CONFIG: PlotConfig = {
    axisConfig: { xLabel: 'Species', yLabel: 'Frequency' },
};

const data = [
    { species: 'Maple', count: 14 },
    { species: 'Oak', count: 27 },
    { species: 'Cherry', count: 10 },
    { species: 'Cedar', count: 16 },
    { species: 'Birch', count: 9 },
    { species: 'Pine', count: 8 },
]

export default function IrisBarChart() {

    return (
        <ChartLayout>
            <BaseBarPlot
                data={data}
                xKey="species"
                yKey="count"
                useDifferentColors={true}
                {...PLOT_CONFIG}
            />
        </ChartLayout>
    );
}
