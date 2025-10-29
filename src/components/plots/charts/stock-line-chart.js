import * as d3 from 'd3'
import { useRef, useState, useEffect, useMemo } from 'react'
import BaseLinePlot from '@/app/components/plots/templates/line-plot'

import styles from '@/app/components/plots/common/page.module.css'

const PLOT_CONFIG = {
    yClasses: ['AAPL', 'MSFT'],
    domainY: [-20, 350],
    themeConfig: { enableZoom: true },
    scaleConfig: { formatNiceY: false },
    axisConfig: { yLabel: 'Stock price ($)', tickFormat: null },
    absolutePositions: { top: '10%', left: '20%' },
}

export default function StockLineChart() {
    const tooltipRef = useRef(null)
    const legendRef = useRef(null)

    const [stockData, setStockData] = useState([])

    const legendConfig = useMemo(
        () => ({ legendRef, absolutePositions: PLOT_CONFIG.absolutePositions }),
        []
    )
    const tooltipConfig = useMemo(() => ({ tooltipRef }), [])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/stock-data')
                const output = await response.json()
                const parsed = d3.csvParse(output, d3.autoType)
                setStockData(parsed)
            } catch (error) {
                console.error('Error fetching data:', error)
                setStockData([])
            }
        }
        fetchData()
    }, [])

    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>
                    <div ref={legendRef} className={styles.legend}></div>
                    <div ref={tooltipRef} className={styles.tooltip}></div>
                    <BaseLinePlot
                        data={stockData}
                        xClass="Date"
                        yClasses={PLOT_CONFIG.yClasses}
                        domainY={PLOT_CONFIG.domainY}
                        themeConfig={PLOT_CONFIG.themeConfig}
                        scaleConfig={PLOT_CONFIG.scaleConfig}
                        axisConfig={PLOT_CONFIG.axisConfig}
                        legendConfig={legendConfig}
                        tooltipConfig={tooltipConfig}
                    />
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.captions}>
                    <p>
                        A line plot of Apple and Microsoft stock prices. Hover
                        over the chart for more info.
                    </p>
                </div>
            </div>
        </div>
    )
}
