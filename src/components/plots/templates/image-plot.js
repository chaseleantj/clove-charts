import * as d3 from 'd3'
import BasePlot from '../common/base'

/**
 * Base Image Plot Component
 *
 * Additional props beyond BasePlot:
 * @param {String} imageURLClass - data field for URL string values
 */
class BaseImagePlot extends BasePlot {
    static requiredProps = ['data', 'imageURLClass']

    static defaultProps = {
        ...BasePlot.defaultProps,
        formatNiceScales: false,
        axisTickCount: 10,
        // showGrid: false,
        // showAxes: false
    }

    constructor(props) {
        super(props)
    }

    renderElements() {
        const image = this.primitives.addImage(
            this.data[0][this.imageURLClass],
            {
                coords: [0.5, 0.5],
                width: 200,
                // useCornerCoords: true,
                coordinateSystem: 'data',
            }
        )

        image.whenReady().then(() => {
            image.setCoords([0.7, 0.8]).render(2000)
            // .end()
            // .then(() => {
            //   image.setCoords([1, 1])
            //   .render(3000)
            // });
        })

        this.onRenderComplete()
    }
}

export default BaseImagePlot
