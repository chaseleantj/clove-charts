'use client';

import BaseImagePlot from '@/components/plots/templates/image-plot';
import { PlotConfig } from '@/components/plots/common/config';
import {
    ChartLayout,
    ChartPlotWrapper,
    ChartFooter,
    ChartCaptions,
} from '@/components/charts/chart-layout';

interface ImageData {
    url: string;
    coords: [number, number];
    width: number;
}

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: true },
    axisConfig: { showGrid: false },
    domainConfig: { domainX: [0, 1000], domainY: [0, 1000] },
};

const IMAGE_DATA: ImageData[] = [
    {
        url: '/images/thale-cress.png',
        coords: [400, 300],
        width: 250,
    },
    {
        url: '/images/zebrafish.png',
        coords: [800, 600],
        width: 150,
    },
];

export default function TestImageChart() {
    return (
        <ChartLayout>
            <ChartPlotWrapper>
                <BaseImagePlot
                    data={IMAGE_DATA}
                    imageURLClass="url"
                    coordsClass="coords"
                    widthClass="width"
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    A chart displaying some nature illustrations from this{' '}
                    <a href="https://airtable.com/appuuiIPhpJ1rdFJc/shr3GNFCWXWQzJq6O/tbliyo8URaoHAKPvG">
                        library
                    </a>
                    .
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
