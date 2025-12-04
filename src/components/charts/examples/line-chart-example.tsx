'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import LinePlot from '../../plots/templates/line-plot';
import { PlotConfig } from '../../plots/common/config';
import {
    ChartLayout,
    ChartFooter,
    ChartCaptions,
} from '../chart-layout';

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
    margin: { left: 60, right: 20 },
    axisConfig: {
        xLabel: 'Date',
        yLabel: 'Price',
        tickFormatY: (domainValue: number) => '$' + String(domainValue),
    },
    legendConfig: {
        enabled: true,
        absolutePositions: {
            top: '20px',
            left: '80px',
            right: undefined,
            bottom: undefined,
        },
    },
    tooltipConfig: {
        enabled: true,
    },
};

export default function LineChartExample() {
    const [stockData, setStockData] = useState<StockData[]>([]);

    useEffect(() => {
        d3.csv('/data/stocks.csv', d3.autoType).then((data) => {
            const parsedData = data as StockData[];
            const filteredData = parsedData.filter((d) => {
                return d.Date && d.Date.getFullYear() >= 2018;
            });
            setStockData(filteredData);
        });
    }, []);

    return (
        <ChartLayout>
            <LinePlot
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
