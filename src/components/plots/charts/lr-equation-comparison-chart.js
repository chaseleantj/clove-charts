import { useRef } from 'react'
import { InlineMath } from 'react-katex'

import LREquationComparison from '@/app/components/plots/charts/linear-regression/lr-equation-comparison-plot'
import styles from '@/app/components/plots/common/page.module.css'

export default function LREquationComparisonChart() {
    const legendRef = useRef(null)

    const legend = <div ref={legendRef} className={styles.legend}></div>

    const captions = (
        <div className={styles.captions}>
            <p>
                The graph of ice cream sales vs temperature, with and without
                the extra term <InlineMath>{'b'}</InlineMath>{' '}
            </p>
        </div>
    )

    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>
                    {legend}
                    <LREquationComparison
                        xLabel="Temperature"
                        yLabel="Ice cream sales"
                        margin={{ top: 20, left: 30, right: 20, bottom: 30 }}
                        axisConfig={{
                            xLabel: 'Temperature',
                            yLabel: 'Ice creams sold',
                            tickSize: 0,
                            tickFormat: (x) => '',
                        }}
                        // legendRef={legendRef}
                    />
                </div>
            </div>
            <div className={styles.footer}>
                {/* {controls} */}
                {captions}
            </div>
        </div>
    )
}
