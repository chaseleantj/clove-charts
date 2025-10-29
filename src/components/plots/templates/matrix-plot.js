import * as d3 from 'd3'

import BasePlot from '../common/base'

/**
 * Base Matrix Plot Component
 *
 * Props beyond BasePlot:
 * @param {Number} padding - Padding between matrix elements
 * @param {Boolean} showCellLabel - Show the value for each matrix element
 * @param {String} colorByClass - Data field to color elements by
 */
class BaseMatrixPlot extends BasePlot {
    static requiredProps = ['data', 'xClass', 'yClass']

    static defaultProps = {
        ...BasePlot.defaultProps,
        padding: 0.05,
        showGrid: false,
        showCellLabel: true,
        showLegend: true,
        formatNiceScales: false,
    }

    constructor(props) {
        super(props)
    }

    onSetupScales() {
        this.scales.x = d3
            .scaleBand()
            .domain(this.domain.x)
            .range([0, this.plotWidth])
            .paddingInner(this.padding)
            .paddingOuter(this.padding)

        this.scales.y = d3
            .scaleBand()
            .domain(this.domain.y)
            .range([0, this.plotHeight])
            .paddingInner(this.padding)
            .paddingOuter(this.padding)

        if (this.colorByClass) {
            this.domain.color = this.domain.getDomain(
                (d) => d[this.colorByClass]
            )
            this.scales.color = this.scales.getColorScale(this.domain.color)
        }
    }

    renderElements() {
        this.primitives.addRectangles(
            this.data,
            (d) => this.scales.x(d[this.xClass]),
            (d) => this.scales.y(d[this.yClass]),
            (d) => this.scales.x(d[this.xClass]) + this.scales.x.bandwidth(),
            (d) => this.scales.y(d[this.yClass]) + this.scales.y.bandwidth(),
            {
                fill: (d) => this.scales.color(d[this.colorByClass]),
                className: 'matrix-plot',
                coordinateSystem: 'pixel',
            }
        )

        if (this.showCellLabel) {
            this.primitives.addTexts(
                this.data,
                (d) =>
                    this.scales.x(d[this.xClass]) +
                    this.scales.x.bandwidth() / 2,
                (d) =>
                    this.scales.y(d[this.yClass]) +
                    this.scales.y.bandwidth() / 2,
                (d) => Math.round(d[this.colorByClass] * 1e3) / 1e3,
                {
                    className: 'matrix-plot-label',
                    coordinateSystem: 'pixel',
                }
            )
        }

        this.onRenderComplete()
    }

    onSetupLegend() {
        this.legend.setTitle(this.colorByClass)
        this.legend.addContinuousLegend(this.scales.color)
    }
}

export default BaseMatrixPlot
