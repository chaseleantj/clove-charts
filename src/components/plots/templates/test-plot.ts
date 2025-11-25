import * as d3 from 'd3';
import BasePlot, { BasePlotProps } from '@/components/plots/common/base-plot';

class BaseTestPlot extends BasePlot {
    constructor(props: BasePlotProps) {
        super(props);
    }

    onSetupDomain() {
        this.domain.x = [0, 10];
        this.domain.y = [0, 10];
    }

    draw() {
        const line = this.primitiveManager.addLine(2, 1, 4, 6, {
            arrow: 'both',
        });

        const point = this.primitiveManager.addPoint(3, 3, {
            symbolType: d3.symbolTriangle,
        });

        const text = this.primitiveManager.addText('2x', 3.5, 3, {
            fontSize: 12,
            fill: 'steelblue',
            // fontFamily: 'Times New Roman',
            latex: true
        });

        // point
        //     .setStyles({
        //         size: 200,
        //         fill: 'red',
        //         stroke: 'black',
        //         pointerEvents: 'auto'
        //     })
        //     .setCoords(2, 6)
        //     .render(4000, d3.easeCubicIn)
        //     .end()
        //     .then(() => {
        //         point.setCoords(4, 7).render(4000, d3.easeCubicOut);
        //     });

        line.setCoords(4, 2, 3, 7).render(5000);

        text.setCoords(4, 5)
            .setAngle(30)
            .setStyles({ fontSize: 30 })
            .render()
        //     .render(5000);

        point.setStyles({
            fill: 'green',
        });

        point.attachEvent('mouseover', (event) => {
            point
                .setStyles({
                    size: 1000,
                })
                .render(1000);
        });
    }
}

export default BaseTestPlot;
