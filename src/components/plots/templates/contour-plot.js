import * as d3 from 'd3';

import BasePlot from '../common/base';
import { linspace, meshgrid } from '../common/utils';

/**
 * Base Contour Plot Component
 *
 * Additional props beyond BasePlot:
 * @param {Function} func - Mathematical function f(x,y) to plot contours for
 * @param {Number} resolutionX - Number of grid points along x-axis (default: 32)
 * @param {Number} resolutionY - Number of grid points along y-axis (default: 32)
 * @param {Number} thresholds - Number of contour levels to generate (default: 10)
 * @param {String} strokeColor - The color of the contour lines ("none" for no lines)
 * @param {Boolean} shadeContour - Whether to shade the contour using the continuous color scheme
 */
class BaseContourPlot extends BasePlot {
    static requiredProps = ['func', 'domainX', 'domainY'];

    static defaultProps = {
        ...BasePlot.defaultProps,
        resolutionX: 32,
        resolutionY: 32,
        thresholds: 10,
        strokeColor: null,
        shadeContour: false,
    };

    constructor(props) {
        super(props);
    }

    onSetupScales() {
        const paddedDomainX = this.domain.padDomain(
            this.scales.x.domain(),
            0.05
        );
        const paddedDomainY = this.domain.padDomain(
            this.scales.y.domain(),
            0.05
        );

        this.xRange = linspace(...paddedDomainX, this.resolutionX);
        this.yRange = linspace(...paddedDomainY, this.resolutionY);

        this.fValues = [];
        for (let j = 0; j < this.resolutionY; j++) {
            for (let i = 0; i < this.resolutionX; i++) {
                this.fValues.push(this.func(this.xRange[i], this.yRange[j]));
            }
        }

        if (this.shadeContour) {
            const fDomain = d3.extent(this.fValues);
            this.scales.color = this.scales.getColorScale(
                fDomain,
                this.colorConfig.continuousColorScheme
            );
            this.strokeColor = this.strokeColor ?? 'black';
        } else {
            this.scales.color = () => 'none';
            this.strokeColor = 'currentColor';
        }
    }

    renderElements() {
        const contours = this.primitives.addContour(
            this.fValues,
            this.xRange,
            this.yRange,
            {
                colorScale: this.scales.color,
                thresholds: this.thresholds,
                stroke: this.strokeColor,
            }
        );

        // const fDomain = d3.extent(this.fValues);
        // contours.setStyles(
        //   {
        //     colorScale: this.scales.getColorScale(fDomain, d3.interpolateViridis),
        //     stroke: "white"
        //   }
        // ).render(3000);

        // let vectors = [];
        // const dF = (x, y) => {
        //   const dx = y * Math.cos(x * y);
        //   const dy = x * Math.cos(x * y);
        //   const norm = Math.sqrt(dx ** 2 + dy ** 2);
        //   const eps = 1e-6;
        //   return [0.3 * dx / (norm + eps), 0.3 * dy / (norm + eps)]
        // };

        // for (let i = 0; i < this.xRange.length; i++) {
        //   for (let j = 0; j < this.yRange.length; j++) {
        //     const grad = dF(this.xRange[i], this.yRange[j])
        //     vectors.push({
        //       x1: this.xRange[i],
        //       y1: this.yRange[j],
        //       x2: this.xRange[i] + grad[0],
        //       y2: this.yRange[j] + grad[1]
        //     })
        //   }
        // }

        // this.primitives.addLines(
        //   vectors,
        //   d => d.x1,
        //   d => d.y1,
        //   d => d.x2,
        //   d => d.y2,
        //   {
        //     "arrow": "end"
        //   }
        // )

    }

    onSetupLegend() {
        if (this.shadeContour) {
            this.legend.addContinuousLegend(this.scales.color);
        }
    }
}

export default BaseContourPlot;
