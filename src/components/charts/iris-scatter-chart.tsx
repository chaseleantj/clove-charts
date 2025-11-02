'use client';

import * as d3 from 'd3';
import { useRef, useState, useEffect, useMemo } from 'react';
import BaseScatterPlot from '@/components/plots/templates/scatter-plot';
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
    themeConfig: { enableZoom: true },
    axisConfig: { xLabel: 'Sepal width (cm)', yLabel: 'Petal length (cm)' },
    margin: { right: 55 },
};

export default function IrisScatterChart() {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const legendRef = useRef<HTMLDivElement>(null);

    const [irisData, setIrisData] = useState<IrisData[]>([]);

    const legendConfig = useMemo(
        () => ({ legendRef, absolutePositions: { top: '0%', right: '0%' } }),
        []
    );
    const tooltipConfig = useMemo(() => ({ tooltipRef }), []);

    useEffect(() => {
        async function fetchData(): Promise<void> {
            try {
                d3.csv(
                    'https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv',
                    d3.autoType
                ).then((data) => {
                    console.log(data);
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
    );
}
