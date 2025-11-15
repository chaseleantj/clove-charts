'use client';

import * as d3 from 'd3';
import { useRef, useState, useEffect, useMemo } from 'react';
import BaseHistogramPlot from '@/components/plots/templates/histogram-plot';
import { PlotConfig } from '@/components/plots/common/config';

import styles from '@/components/plots/common/page.module.css';

interface IrisData {
    sepal_length: number;
    sepal_width: number;
    petal_length: number;
    petal_width: number;
    species: string;
}

const PLOT_CONFIG: PlotConfig = {
    themeConfig: { enableZoom: false },
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Frequency'},
    margin: { right: 55 },
};

export default function IrisHistogramChart() {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const legendRef = useRef<HTMLDivElement>(null);

    const [irisData, setIrisData] = useState<IrisData[]>([]);
    const legendConfig = useMemo(() => ({ legendRef, absolutePositions: { top: '0%', right: '0%' } }), []);
    const tooltipConfig = useMemo(() => ({ tooltipRef }), []);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv(
                    'https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv',
                    d3.autoType
                ).then((data) => {
                    setIrisData(data as IrisData[]);
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setIrisData([]);
            }
        }
        fetchData();
    }, []);

    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>
                    <div ref={legendRef} className={styles.legend}></div>
                    <div ref={tooltipRef} className={styles.tooltip}></div>
                    <BaseHistogramPlot
                        data={irisData}
                        xClass="sepal_width"
                        numBins={10}
                        // yClass="petal_length"
                        // colorByClass="petal_width"
                        legendConfig={legendConfig}
                        tooltipConfig={tooltipConfig}
                        {...PLOT_CONFIG}
                    />
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.captions}>
                    <p>
                        A histogram plot of the iris dataset.
                    </p>
                </div>
            </div>
        </div>
    );
}
