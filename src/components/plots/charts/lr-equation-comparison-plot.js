import BasePlot from '@/app/components/plots/common/base'

export default class LREquationComparison extends BasePlot {
    constructor(props) {
        super(props)
    }

    renderElements() {
        const colors = this.colorConfig.categoricalColorScheme

        const w = 0.5
        const b = 0.2
        const [x1, x2] = this.domain.x

        this.line1 = this.primitives.addLine(x1, w * x1, x2, w * x2, {
            stroke: colors[0],
            strokeWidth: 2,
        })

        this.line2 = this.primitives.addLine(x1, w * x1 + b, x2, w * x2 + b, {
            stroke: colors[1],
            strokeWidth: 2,
        })

        // Add labels
        const labelX = 0.4
        const labelY1 = 0.32
        const labelY2 = 0.52

        const text1 = `\\textcolor{${colors[0]}}{y = wx}`
        const text2 = `\\textcolor{${colors[1]}}{y = wx + b}`

        this.primitives.addText(text1, labelX, labelY1, {
            latex: true,
            angle: -23,
        })

        this.primitives.addText(text2, labelX, labelY2, {
            latex: true,
            angle: -23,
        })

        this.onRenderComplete()
    }
}
