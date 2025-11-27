'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseLinePlot from '@/components/plots/templates/line-plot';
import { PlotConfig } from '@/components/plots/common/config';
import {
    ChartLayout,
    ChartFooter,
    ChartCaptions,
} from '@/components/charts/chart-layout';

interface StockData {
    Date: Date;
    AAPL: number | null;
    ABB: number | null;
    HPQ: number | null;
    MSFT: number | null;
    NVDA: number | null;
}

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: true },
    domainConfig: { domainY: [0, 350] },
    axisConfig: {
        xLabel: 'Date',
        yLabel: 'Price',
        showGrid: true,
        tickFormatY: (domainValue: number) => '$' + String(domainValue),
    },
    legendConfig: {
        enabled: true,
    },
    tooltipConfig: {
        enabled: true,
    },
    margin: { left: 60, right: 60 },
};

export default function StocksLineChart() {
    const [stockData, setStockData] = useState<StockData[]>([]);

    useEffect(() => {
                d3.csv('/data/stocks.csv', d3.autoType).then((data) => {
                    const parsedData = data as StockData[];
                    const filteredData = parsedData.filter((d) => {
                        return d.Date && d.Date.getFullYear() >= 2010;
                    });
                    setStockData(filteredData);
                });
    }, []);

    return (
        <ChartLayout>
            <BaseLinePlot
                data={stockData}
                xKey="Date"
                yKeys={['AAPL', 'ABB', 'HPQ', 'MSFT', 'NVDA']}
                {...PLOT_CONFIG}
            />
            <ChartFooter>
                <ChartCaptions>
                    Historical stock prices for major tech companies.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}
