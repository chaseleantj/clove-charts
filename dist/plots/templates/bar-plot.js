import * as d3 from 'd3';
import BasePlot from '../common/base-plot';
import { mergeWithDefaults } from '../common/utils';
export const DEFAULT_BAR_PLOT_CONFIG = {
    padding: 0.2,
    useDifferentColors: true,
};
class BarPlot extends BasePlot {
    constructor(props) {
        super(props);
    }
    onInitializeProperties() {
        this.barPlotConfig = mergeWithDefaults(DEFAULT_BAR_PLOT_CONFIG, this.props);
    }
    configureDomainAndScales() {
        var _a, _b;
        const minValue = this.config.scaleConfig.logY ? 1 : 0;
        this.domain = {
            x: this.getDefaultDomainX(),
            y: (_a = this.config.domainConfig.domainY) !== null && _a !== void 0 ? _a : [
                minValue,
                this.getDefaultDomainY()[1],
            ],
        };
        const padding = (_b = this.props.padding) !== null && _b !== void 0 ? _b : this.barPlotConfig.padding;
        this.scale = {
            x: d3
                .scaleBand()
                .domain(this.domain.x)
                .range([0, this.plotWidth])
                .paddingInner(padding)
                .paddingOuter(padding),
            y: this.getDefaultScaleY(),
        };
        if (this.barPlotConfig.useDifferentColors) {
            const xValues = this.props.data.map((d) => d[this.props.xKey]);
            const categoryDomain = this.domainManager.getDomain(xValues);
            this.scale.color = this.scaleManager.getColorScale(categoryDomain);
        }
    }
    draw() {
        const fillOption = typeof this.scale.color === 'function'
            ? (d) => this.scale.color(d[this.props.xKey])
            : this.config.colorConfig.defaultColor;
        this.primitiveManager.addRectangles(this.props.data, (d) => this.scale.x(d[this.props.xKey]), (d) => this.scale.y(d[this.props.yKey]), (d) => this.scale.x(d[this.props.xKey]) +
            this.scale.x.bandwidth(), () => this.scale.y(this.domain.y[0]), {
            opacity: this.config.themeConfig.opacity,
            fill: fillOption,
            coordinateSystem: 'pixel',
        });
    }
}
export default BarPlot;
