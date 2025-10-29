import * as d3 from 'd3'
import { v4 as uuidv4 } from 'uuid'
import BasePlot from '../common/base'
import BrushManager from '../common/brush-manager'
import linearRegression from '@/app/math/regression'

class BaseRegressionPlot extends BasePlot {
    static defaultProps = {
        ...BasePlot.defaultProps,
        pointSize: 128,
        w: null,
        b: null,
        interactive: false,
        showResiduals: false,
    }
    constructor(props) {
        super(props)
        this.initialRender = true
        this.points = this.points || []
        // Each point will manage its own residual line when showResiduals is true, so no batch container needed
    }

    setupBrush() {
        if (!this.interactive) return
        this.brush = new BrushManager(
            this.plot,
            [
                [0, 0],
                [this.plotWidth, this.plotHeight],
            ],
            this.removePointsWithBrush.bind(this),
            () => {},
            this.themeConfig.transitionDuration
        )

        this.onSetupBrush()
    }

    addRegressionPoint(x, y, transitionDuration = 0) {
        const id = uuidv4()

        const point = this.primitives.addPoint(x, y, {
            size: this.pointSize / 2,
            stroke: 'light-dark(white, black)',
            fill: 'currentColor',
            dataId: id,
            className: 'data-point',
            pointerEvents: 'auto',
        })

        this.points.push({
            id: id,
            element: point,
            coords: [x, y],
            residual: null, // Will hold the residual line primitive when showResiduals is enabled
        })

        point
            .setSize(this.pointSize)
            .render(transitionDuration, d3.easeElastic.amplitude(2))
    }

    getParameters() {
        if (this.w || this.b) {
            const w = this.w ?? 1
            const b = this.b ?? 0

            const f = (x) => w * x + b
            return { w, b, f }
        } else {
            const coords = this.points.map((p) => p.coords)
            const { w, b, f } = linearRegression(coords)
            return { w, b, f }
        }
    }

    updateRegressionLine(f, transitionDuration = 0) {
        const [x1, x2] = this.domain.x
        const [y1, y2] = [f(x1), f(x2)]

        this.line.setCoords(x1, y1, x2, y2).render(transitionDuration)

        if (this.showResiduals) {
            this.renderResiduals(f, transitionDuration)
        }
    }

    renderResiduals(f, transitionDuration = 0) {
        // Iterate through points and create/update individual residual lines
        this.points.forEach((p) => {
            const [x, yPoint] = p.coords
            const yFit = f(x)

            if (p.residual) {
                // Update existing residual line
                p.residual
                    .setCoords(x, yPoint, x, yFit)
                    .render(transitionDuration)
            } else {
                // Create new residual line for this point
                p.residual = this.primitives.addLine(x, yPoint, x, yPoint, {
                    stroke: 'red',
                    strokeWidth: 2,
                    strokeDashArray: '4,4',
                    opacity: 0.8,
                    className: 'residual-line',
                })
                p.residual
                    .setCoords(x, yPoint, x, yFit)
                    .render(transitionDuration)
            }
        })
    }

    removePointsWithBrush(extent) {
        const [[x1, y1], [x2, y2]] = extent.map(([x, y]) => [
            this.scales.x.invert(x),
            this.scales.y.invert(y),
        ])

        this.points = this.points.filter((p) => {
            const [px, py] = p.coords
            const withinBounds =
                px >= Math.min(x1, x2) &&
                px <= Math.max(x1, x2) &&
                py >= Math.min(y1, y2) &&
                py <= Math.max(y1, y2)

            if (withinBounds) {
                // Remove point and its associated residual line (if any)
                p.element.remove()
                if (p.residual) {
                    p.residual.remove()
                }
                return false
            }
            return true
        })

        const { w, b, f } = this.getParameters()
        this.updateRegressionLine(f, this.themeConfig.transitionDuration)
    }

    renderElements() {
        this.line = this.primitives.addLine(0, 0, 0, 0)

        // Re-render existing points during window resize
        const dataCoords =
            this.data && this.initialRender
                ? this.data.map((p) => p.coords)
                : []
        const existingCoords = this.points.map((p) => p.coords)
        const coords = dataCoords.concat(existingCoords)

        this.points = [] // Clear the array to rebuild with new elements
        this.initialRender = false

        coords.forEach(([x, y]) => {
            this.addRegressionPoint(x, y, 0)
        })

        const { w, b, f } = this.getParameters()
        this.updateRegressionLine(f, 0)

        if (this.interactive) {
            this.interactionSurface.on('click', (event) => {
                const [x, y] = this.getEventCoords(event, 'data')
                const duration = this.themeConfig.transitionDuration
                this.addRegressionPoint(x, y, duration)

                const { w, b, f } = this.getParameters()
                this.updateRegressionLine(f, duration)
            })
        }
    }
}

export default BaseRegressionPlot
