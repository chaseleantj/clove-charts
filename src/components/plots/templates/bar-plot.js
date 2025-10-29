import * as d3 from 'd3';
import BasePlot from '../common/base';

/**
 * Base Bar Plot Component
 *
 * Props beyond BasePlot:
 * @param {String} orientation - 'vertical' (default) or 'horizontal'
 * @param {Number} padding - Padding between bars for both orientations
 * @param {String} colorByClass - Data field to color elements by
 */
class BaseBarPlot extends BasePlot {
    static requiredProps = ['data'];

    static defaultProps = {
        ...BasePlot.defaultProps,
        padding: 0.2,
        orientation: 'vertical',
        formatNiceScales: true,
    };

    constructor(props) {
        super(props);
        this.orientation = props.orientation || 'vertical';
    }

    shouldInitializeChart() {
        if (!super.shouldInitializeChart()) {
            return false;
        }
        if (!this.props.xClass && !this.props.yClass) {
            console.warn(
                "BaseBarPlot: Must provide either 'xClass' or 'yClass' prop"
            );
            return false;
        }
        return true;
    }

    onSetupDomain() {
        if (this.orientation === 'vertical') {
            // Vertical: categorical X, continuous Y
            const minValue = this.scaleConfig.logY ? 1 : 0;
            this.domain.y = this.domainY ?? [minValue, this.domain.y[1]];
        } else {
            // Horizontal: continuous X, categorical Y
            const minValue = this.scaleConfig.logX ? 1 : 0;
            this.domain.x = this.domainX ?? [minValue, this.domain.x[1]];
        }
    }

    onSetupScales() {
        if (this.orientation === 'vertical') {
            // Vertical bars: band scale for X (categories), linear scale for Y (values)
            this.scales.x = d3
                .scaleBand()
                .domain(this.domain.x)
                .range([0, this.plotWidth])
                .paddingInner(this.padding)
                .paddingOuter(this.padding);
        } else {
            // Horizontal bars: linear scale for X (values), band scale for Y (categories)
            this.scales.y = d3
                .scaleBand()
                .domain(this.domain.y)
                .range([this.plotHeight, 0])
                .paddingInner(this.padding)
                .paddingOuter(this.padding);
        }

        if (this.colorByClass) {
            this.domain.color = this.domain.getDomain(
                (d) => d[this.colorByClass]
            );
            this.scales.color = this.scales.getColorScale(this.domain.color);
        }
    }

    renderElements() {
        const barOpacity = this.opacity ?? this.themeConfig.barOpacity;
        const barColor = this.colorConfig.defaultColor;

        let x1Accessor, y1Accessor, x2Accessor, y2Accessor;

        if (this.orientation === 'vertical') {
            // Vertical bars
            x1Accessor = (d) => this.scales.x(d[this.xClass]);
            y1Accessor = (d) => this.scales.y(d[this.yClass]);
            x2Accessor = (d) =>
                this.scales.x(d[this.xClass]) + this.scales.x.bandwidth();
            y2Accessor = (d) => this.scales.y(this.domain.y[0]);
        } else {
            // Horizontal bars
            x1Accessor = (d) => this.scales.x(this.domain.x[0]);
            y1Accessor = (d) => this.scales.y(d[this.yClass]);
            x2Accessor = (d) => this.scales.x(d[this.xClass]);
            y2Accessor = (d) =>
                this.scales.y(d[this.yClass]) + this.scales.y.bandwidth();
        }

        this.primitives.addRectangles(
            this.data,
            x1Accessor,
            y1Accessor,
            x2Accessor,
            y2Accessor,
            {
                opacity: barOpacity,
                fill: (d) =>
                    this.colorByClass
                        ? this.scales.color(d[this.colorByClass])
                        : barColor,
                className: 'barplot',
                coordinateSystem: 'pixel',
            }
        );

        this.onRenderComplete();
    }
}

export default BaseBarPlot;
