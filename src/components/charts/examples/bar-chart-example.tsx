'use client';

import BarPlot from '../../plots/templates/bar-plot';
import { PlotConfig } from '../../plots/common/config';
import { ChartLayout } from '../chart-layout';

const PLOT_CONFIG: PlotConfig = {
    axisConfig: { xLabel: 'Species', yLabel: 'Frequency', showGridX: false },
};

const data = [
    { species: 'Maple', count: 14 },
    { species: 'Oak', count: 27 },
    { species: 'Cherry', count: 10 },
    { species: 'Cedar', count: 16 },
    { species: 'Birch', count: 9 },
    { species: 'Pine', count: 8 },
];

export default function BarChartExample() {
    return (
        <ChartLayout>
            <BarPlot
                data={data}
                xKey="species"
                yKey="count"
                useDifferentColors={true}
                {...PLOT_CONFIG}
            />
        </ChartLayout>
    );
}
