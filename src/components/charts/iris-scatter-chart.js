'use client';

import * as d3 from 'd3';
import { useRef, useState, useEffect, useMemo } from 'react'
import BaseScatterPlot from '@/components/plots/templates/scatter-plot'

import styles from '@/components/plots/common/page.module.css'

const PLOT_CONFIG = {
    themeConfig: { enableZoom: true },
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Petal length (cm)' },
    absolutePositions: { top: '0%', right: '0%' },
    margin: { right: 55 },
}

export default function IrisScatterChart() {
    const tooltipRef = useRef(null)
    const legendRef = useRef(null)

    const [irisData, setIrisData] = useState([])

    const legendConfig = useMemo(
        () => ({ legendRef, absolutePositions: PLOT_CONFIG.absolutePositions }),
        []
    )
    const tooltipConfig = useMemo(() => ({ tooltipRef }), [])

    useEffect(() => {
        async function fetchData() {
            try {
                d3.csv("https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv", d3.autoType).then(
                    (data) => {
                        console.log(data);
                        setIrisData(data);
                    }
                )
            } catch (error) {
                console.error('Error fetching data:', error)
                setIrisData([])
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
                    <BaseScatterPlot
                        data={irisData}
                        xClass="sepal_width"
                        yClass="petal_length"
                        colorByClass="petal_width"
                        themeConfig={PLOT_CONFIG.themeConfig}
                        axisConfig={PLOT_CONFIG.axisConfig}
                        legendConfig={legendConfig}
                        tooltipConfig={tooltipConfig}
                        margin={PLOT_CONFIG.margin}
                    />
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.captions}>
                    <p>
                        A scatter plot of the iris dataset. Hover over the
                        points for more info.
                    </p>
                </div>
            </div>
        </div>
    )
}
