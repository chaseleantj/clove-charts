import { useRef, useMemo } from 'react'
import BaseRegressionPlot from '@/app/components/plots/templates/regression-plot'

import styles from '@/app/components/plots/common/page.module.css'

export default function LRInteractiveChart() {
    const data = useMemo(
        () => [
            { coords: [0.2, 0.1] },
            { coords: [0.3, 0.5] },
            { coords: [0.5, 0.3] },
            { coords: [0.7, 0.6] },
            { coords: [0.9, 0.9] },
        ],
        []
    )
    const margin = useMemo(() => ({ top: 5, left: 5, right: 5, bottom: 5 }), [])
    const axisConfig = useMemo(
        () => ({
            showAxis: false,
            showGrid: false,
            tickSize: 0,
            tickFormat: (x) => '',
        }),
        []
    )

    const captions = (
        <div className={styles.captions}>
            An interactive linear regression plot. Click on the plot to add
            points. Drag a box around the points to remove them.
        </div>
    )

    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>
                    <BaseRegressionPlot
                        data={data}
                        margin={margin}
                        axisConfig={axisConfig}
                        interactive={true}
                        showResiduals={true}
                    />
                </div>
            </div>
            <div className={styles.footer}>{captions}</div>
        </div>
    )
}
