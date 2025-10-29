import { useRef, useState, useMemo } from 'react'
import BaseRegressionPlot from '@/app/components/plots/templates/regression-plot'
import { Slider } from '@/app/components/inputs/inputs'

import styles from '@/app/components/plots/common/page.module.css'

export default function LRSliderChart() {
    const [w, setW] = useState(1)
    const [b, setB] = useState(0)

    const data = useMemo(() => [
        { coords: [0.2, 0.1] },
        { coords: [0.3, 0.5] },
        { coords: [0.5, 0.3] },
        { coords: [0.7, 0.6] },
        { coords: [0.9, 0.9] },
    ])

    const weightSlider = (
        <Slider
            min={-5}
            max={5}
            step={0.01}
            value={w}
            labelElement={'w'}
            handleInput={(value) => setW(value)}
        />
    )

    const biasSlider = (
        <Slider
            min={-5}
            max={5}
            step={0.01}
            value={b}
            labelElement={'b'}
            handleInput={(value) => setB(value)}
        />
    )

    const captions = (
        <div className={styles.captions}>
            <p>
                An interactive linear regression plot. Click on the plot to add
                points. Drag a box around the points to remove them.
            </p>
        </div>
    )

    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>
                    <BaseRegressionPlot
                        data={data}
                        w={w}
                        b={b}
                        showResiduals={true}
                    />
                </div>
            </div>
            <div className={styles.footer}>
                {weightSlider}
                {biasSlider}
                {captions}
            </div>
        </div>
    )
}
