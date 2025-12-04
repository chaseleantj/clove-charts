import * as d3 from 'd3';
import BasePlot from '../common/base-plot';
export const DEFAULT_MATRIX_PLOT_CONFIG = {
    padding: 0.05,
    showGrid: false,
    showCellLabel: true,
};
export function getMatrixPlotConfig(props) {
    var _a, _b, _c;
    return {
        padding: (_a = props.padding) !== null && _a !== void 0 ? _a : DEFAULT_MATRIX_PLOT_CONFIG.padding,
        showGrid: (_b = props.showGrid) !== null && _b !== void 0 ? _b : DEFAULT_MATRIX_PLOT_CONFIG.showGrid,
        showCellLabel: (_c = props.showCellLabel) !== null && _c !== void 0 ? _c : DEFAULT_MATRIX_PLOT_CONFIG.showCellLabel,
    };
}
class MatrixPlot extends BasePlot {
    constructor(props) {
        super(props);
    }
    onInitializeProperties() {
        this.matrixPlotConfig = getMatrixPlotConfig(this.props);
    }
    configureDomainAndScales() {
        var _a;
        this.domain = this.getDefaultDomain();
        const data = ((_a = this.props.data) !== null && _a !== void 0 ? _a : []);
        const colorValues = data.map((d) => d[this.props.valueKey]);
        this.domain.color = this.domainManager.getDomain(colorValues);
        this.scale = {
            x: d3
                .scaleBand()
                .domain(this.domain.x)
                .range([0, this.plotWidth])
                .paddingInner(this.matrixPlotConfig.padding)
                .paddingOuter(this.matrixPlotConfig.padding),
            y: d3
                .scaleBand()
                .domain(this.domain.y)
                .range([0, this.plotHeight])
                .paddingInner(this.matrixPlotConfig.padding)
                .paddingOuter(this.matrixPlotConfig.padding),
            color: this.scaleManager.getColorScale(this.domain.color),
        };
    }
    draw() {
        const colorKey = this.props.valueKey;
        this.primitiveManager.addRectangles(this.props.data, (d) => this.scale.x(d[this.props.xKey]), (d) => this.scale.y(d[this.props.yKey]), (d) => this.scale.x(d[this.props.xKey]) +
            this.scale.x.bandwidth(), (d) => this.scale.y(d[this.props.yKey]) +
            this.scale.y.bandwidth(), {
            fill: (d) => this.scale.color && colorKey
                ? this.scale.color(d[colorKey])
                : this.config.colorConfig.defaultColor,
            coordinateSystem: 'pixel',
            opacity: this.config.themeConfig.opacity,
        });
        if (this.matrixPlotConfig.showCellLabel && colorKey) {
            this.primitiveManager.addTexts(this.props.data, (d) => this.scale.x(d[this.props.xKey]) +
                this.scale.x.bandwidth() / 2, (d) => this.scale.y(d[this.props.yKey]) +
                this.scale.y.bandwidth() / 2, (d) => {
                const val = d[colorKey];
                return typeof val === 'number'
                    ? (Math.round(val * 1e2) / 1e2).toString()
                    : val;
            }, {
                coordinateSystem: 'pixel',
                anchor: 'middle',
                baseline: 'middle',
            });
        }
    }
    drawLegend() {
        var _a;
        this.legendManager.setTitle((_a = this.config.legendConfig.title) !== null && _a !== void 0 ? _a : this.props.valueKey);
        if (this.scale.color) {
            this.legendManager.addLegend(this.scale.color, 'rect');
        }
    }
}
export default MatrixPlot;
