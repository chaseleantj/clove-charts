import * as d3 from 'd3'

import BasePlot from '../common/base'
import ScaleManager from '../common/scale-manager'

/**
 * Base Histogram Plot Component
 *
 * Props beyond BasePlot:
 * @param {String} xClass - Data field for values to be binned
 * @param {Number} numBins - Suggested number of bins for the histogram
 * @param {String} yLabel - Label for the y-axis (defaults to "Frequency")
 */
class BaseHistogramPlot extends BasePlot {
    static requiredProps = ['data', 'xClass']
    static defaultProps = {
        ...BasePlot.defaultProps,
        numBins: 20,
        yLabel: 'Frequency',
        formatNiceScales: false,
    }

    constructor(props) {
        super(props)
        this.bins = []
    }

    onSetupDomain() {
        if (this.scaleConfig.logX) {
            this.domain.x = [
                Math.log10(this.domain.x[0]),
                Math.log10(this.domain.x[1]),
            ]
        }
        // y-domain cannot be setup yet
    }

    setupScales() {
        this.scales = new ScaleManager(this.colorConfig)

        this.scales.x = this.scales.getScale(
            this.domain.x,
            [0, this.plotWidth],
            // For histograms, the x-scale is always linear after domain adjustment for logX
            false,
            this.scaleConfig.formatNiceX
        )

        const numBins = this.numBins
        const histogramGenerator = d3
            .bin()
            .value((d) =>
                this.scaleConfig.logX
                    ? Math.log10(d[this.xClass])
                    : d[this.xClass]
            )
            .domain(this.scales.x.domain())
            .thresholds(this.scales.x.ticks(numBins))
        this.bins = histogramGenerator(this.data)

        const yMax = d3.max(this.bins, (d) => d.length)
        this.domain.y = this.scaleConfig.logY
            ? [1, Math.max(1, yMax)]
            : [0, yMax]

        this.scales.y = this.scales.getScale(
            this.domain.y,
            [this.plotHeight, 0],
            this.scaleConfig.logY,
            this.scaleConfig.formatNiceY
        )

        this.onSetupScales()
    }

    renderElements() {
        const barOpacity = this.opacity ?? 1
        const barColor = this.colorConfig.defaultColor

        const data = this.bins
            .filter((binData) => binData.length > 0)
            .map((binData) => {
                const pad = 0.025 * (binData.x1 - binData.x0)
                return {
                    x1: binData.x0 + pad,
                    y1: binData.length,
                    x2: binData.x1 - pad,
                    y2: this.domain.y[0],
                }
            })

        this.primitives.addRectangles(
            data,
            (d) => d.x1,
            (d) => d.y1,
            (d) => d.x2,
            (d) => d.y2,
            {
                fill: barColor,
                opacity: barOpacity,
                className: 'histogram-bar',
            }
        )

        // this.bins.forEach((binData, index) => {
        //     if (binData.length === 0) return;

        //     const pad = 0.025 * (binData.x1 - binData.x0)

        //     this.primitives.addRectangle(
        //         binData.x0 + pad,
        //         binData.length,
        //         binData.x1 - pad,
        //         this.domain.y[0],
        //         {
        //             fill: barColor,
        //             opacity: barOpacity,
        //             className: 'histogram-bar',
        //             dataId: `bin-${index}`,
        //         }
        //     );
        // });

        this.onRenderComplete()
    }
}

export default BaseHistogramPlot
