'use client';

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import BaseLinePlot from '@/components/plots/templates/line-plot';
import { PlotConfig } from '@/components/plots/common/config';
import {
    ChartLayout,
    ChartPlotWrapper,
    ChartLegend,
    ChartTooltip,
    ChartFooter,
    ChartCaptions,
    useChartLegend,
    useChartTooltip,
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
    axisConfig: { xLabel: 'Date', yLabel: 'Price', showGrid: true, tickFormatY: (domainValue: number) => '$' + String(domainValue) },
    margin: { left: 60, right: 80 },
};

export default function StocksLineChart() {
    const [stockData, setStockData] = useState<StockData[]>([]);
    const { legendRef, legendConfig } = useChartLegend();
    const { tooltipRef, tooltipConfig } = useChartTooltip();

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv(
                    '/data/stocks.csv',
                    d3.autoType
                ).then((data) => {
                    const parsedData = data as StockData[];
                    const filteredData = parsedData.filter((d) => {
                        return d.Date && d.Date.getFullYear() >= 2010;
                    });
                    setStockData(filteredData);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setStockData([]);
            }
        }
        fetchData();
    }, []);

    return (
        <ChartLayout>
            <ChartPlotWrapper>
                <ChartLegend ref={legendRef} />
                <ChartTooltip ref={tooltipRef} />
                <BaseLinePlot
                    data={stockData}
                    xClass="Date"
                    yClass={['AAPL', 'ABB', 'HPQ', 'MSFT', 'NVDA']}
                    legendConfig={legendConfig}
                    tooltipConfig={tooltipConfig}
                    {...PLOT_CONFIG}
                />
            </ChartPlotWrapper>
            <ChartFooter>
                <ChartCaptions>
                    Historical stock prices for major tech companies.
                </ChartCaptions>
            </ChartFooter>
        </ChartLayout>
    );
}

