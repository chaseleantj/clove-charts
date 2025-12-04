import * as d3 from 'd3';
import BasePlot from '../common/base-plot';
import { isContinuousScale, } from '../common/scale-manager';
// For configs with generic function types, keep explicit defaults
export const DEFAULT_SCATTER_PLOT_CONFIG = {
    pointSize: 50,
    colorKey: null,
    symbolType: d3.symbolCircle,
};
// Generic configs need explicit getConfig functions to preserve type parameters
export function getScatterPlotConfig(props, themeConfig) {
    var _a, _b, _c, _d;
    return {
        pointSize: (_a = props.pointSize) !== null && _a !== void 0 ? _a : DEFAULT_SCATTER_PLOT_CONFIG.pointSize,
        colorKey: (_b = props.colorKey) !== null && _b !== void 0 ? _b : null,
        pointOpacity: (_c = props.pointOpacity) !== null && _c !== void 0 ? _c : themeConfig.opacity,
        symbolType: (_d = props.symbolType) !== null && _d !== void 0 ? _d : DEFAULT_SCATTER_PLOT_CONFIG.symbolType,
    };
}
class ScatterPlot extends BasePlot {
    constructor(props) {
        super(props);
    }
    shouldInitializeChart() {
        return this.props.data.length > 0;
    }
    onInitializeProperties() {
        this.scatterPlotConfig = getScatterPlotConfig(this.props, this.config.themeConfig);
    }
    configureDomainAndScales() {
        this.domain = this.getDefaultDomain();
        this.scale = this.getDefaultScales();
        const colorKey = this.scatterPlotConfig.colorKey;
        if (colorKey) {
            const colorValues = this.props.data.map((d) => d[colorKey]);
            this.domain.color = this.domainManager.getDomain(colorValues);
            this.scale.color = this.scaleManager.getColorScale(this.domain.color);
        }
    }
    getCoordinateAccessor(key, scale) {
        if (isContinuousScale(scale)) {
            return (d) => d[key];
        }
        return (d) => {
            const val = d[key];
            const bandScale = scale;
            const scaled = bandScale(val);
            if (scaled === undefined)
                return null;
            // Center the point in the band
            return scaled + bandScale.bandwidth() / 2;
        };
    }
    draw() {
        const { pointSize, pointOpacity, colorKey } = this.scatterPlotConfig;
        const sizeOption = typeof pointSize === 'function'
            ? (d) => pointSize(d)
            : pointSize;
        const opacityOption = typeof pointOpacity === 'function'
            ? (d) => pointOpacity(d)
            : pointOpacity;
        const fillOption = typeof this.scale.color === 'function' && colorKey
            ? (d) => this.scale.color(d[colorKey])
            : this.config.colorConfig.defaultColor;
        this.dataPoints = this.primitiveManager.addPoints(this.props.data, this.getCoordinateAccessor(this.props.xKey, this.scale.x), this.getCoordinateAccessor(this.props.yKey, this.scale.y), {
            symbolType: d3.symbolCircle,
            fill: fillOption,
            size: sizeOption,
            opacity: opacityOption,
        });
    }
    drawLegend() {
        var _a;
        if (!this.scatterPlotConfig.colorKey)
            return;
        this.legendManager.setTitle((_a = this.config.legendConfig.title) !== null && _a !== void 0 ? _a : this.scatterPlotConfig.colorKey);
        if (this.scale.color) {
            this.legendManager.addLegend(this.scale.color, 'point', {
                symbolType: d3.symbolCircle,
            });
        }
    }
    drawTooltip() {
        var _a;
        const displayKeys = this.scatterPlotConfig.colorKey
            ? [
                this.props.xKey,
                this.props.yKey,
                this.scatterPlotConfig.colorKey,
            ]
            : [this.props.xKey, this.props.yKey];
        const tooltipDisplayKeys = (_a = this.config.tooltipConfig.tooltipKeys) !== null && _a !== void 0 ? _a : displayKeys;
        const getPointSize = (d) => {
            const { size } = this.dataPoints.options;
            return typeof size === 'number' ? size : size(d);
        };
        const animatePoint = (target, sizeMultiplier, d) => {
            const size = getPointSize(d) * sizeMultiplier;
            const symbolGenerator = d3
                .symbol()
                .type(d3.symbolCircle)
                .size(size);
            d3.select(target)
                .transition()
                .duration(this.config.themeConfig.transitionDuration / 4)
                .attr('d', symbolGenerator);
        };
        this.dataPoints
            .attachEvent('mouseover', (event, d) => {
            if (!this.brushManager || !this.brushManager.brushing) {
                animatePoint(event.currentTarget, 4, d);
                this.tooltipManager.show(event, d, tooltipDisplayKeys);
            }
        })
            .attachEvent('mouseout', (event, d) => {
            if (!this.brushManager || !this.brushManager.brushing) {
                animatePoint(event.currentTarget, 1, d);
                this.tooltipManager.hide();
            }
        });
        this.interactionSurface.on('click', () => this.tooltipManager.hide());
    }
}
export default ScatterPlot;
