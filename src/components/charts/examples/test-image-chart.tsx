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
        url: 'https://v5.airtableusercontent.com/v3/u/47/47/1763848800000/cG2dR2XNM1lLiuNHU6sT7A/TlloblTAg7WShkVq_5AOK4J47dCb9D_zPao9MoGjir3QXdGHniJsOwIC5cHB4oQrtiWxhzvJqwiOydHLO5c058E-B14jyWCsQhZgwX2WFJFVoU3ZRZC_TY7CMDBbGfcY1b8KOLBBNXg9kPvuTaoMAw/7bOSddw7uSavVBhel_5S4nORTTmGH9t5P9iV3r7XqIc',
        coords: [400, 300],
        width: 250,
    },
    {
        url: 'https://v5.airtableusercontent.com/v3/u/47/47/1763848800000/AyKiZXHCubb0uxfJcD1YAw/egGhzg2a9q2AwgV2UM-5Iges7EeGSZ0IF2uKLH_DAguaYKFUb0AwgMqMC3A33ST1cqTnqoZ01OQpo6WWNZtkOBkcRcRbmc2A-ZwHKyqlA05yJ0uHNNySN1QdeUCGYnNr3uYVcPQPBF-JUZlKxsSimg/gVw5Y2JBT6Ilra12EymrH3aWPYUXIEOiBVydzEmdcWY',
        coords: [800, 600],
        width: 150,
    },
    {
        url: 'https://v5.airtableusercontent.com/v3/u/47/47/1763848800000/qaR4dd-35P6eFY2yMJyhgQ/IBKpTAcuF3FHGWHAgAyLr2dj_wy270QbYHCoro9f4RX7RWo5x5KFEOTqYdHeWNM70H-BKWM6CgBxVbck73V2pspPDIQiMUhb3T4gmBL9S-ZAIVTRNGn2dYJuP7J7JFu-YmGXCrcIjCr1paMdjxe8MA/M8d5cTYMQNOSBQ-lkwSDfrguW_0_zFY1PIzDF65GhYk',
        coords: [300, 800],
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
                    A test chart displaying some cool nature illustrations from this <a href="https://airtable.com/appuuiIPhpJ1rdFJc/shr3GNFCWXWQzJq6O/tbliyo8URaoHAKPvG">library</a>.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}

