"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SCATTER_PLOT_CONFIG = void 0;
exports.getScatterPlotConfig = getScatterPlotConfig;
const d3 = __importStar(require("d3"));
const base_plot_1 = __importDefault(require("../common/base-plot"));
const scale_manager_1 = require("../common/scale-manager");
// For configs with generic function types, keep explicit defaults
exports.DEFAULT_SCATTER_PLOT_CONFIG = {
    pointSize: 50,
    colorKey: null,
    symbolType: d3.symbolCircle,
};
// Generic configs need explicit getConfig functions to preserve type parameters
function getScatterPlotConfig(props, themeConfig) {
    var _a, _b, _c, _d;
    return {
        pointSize: (_a = props.pointSize) !== null && _a !== void 0 ? _a : exports.DEFAULT_SCATTER_PLOT_CONFIG.pointSize,
        colorKey: (_b = props.colorKey) !== null && _b !== void 0 ? _b : null,
        pointOpacity: (_c = props.pointOpacity) !== null && _c !== void 0 ? _c : themeConfig.opacity,
        symbolType: (_d = props.symbolType) !== null && _d !== void 0 ? _d : exports.DEFAULT_SCATTER_PLOT_CONFIG.symbolType,
    };
}
class ScatterPlot extends base_plot_1.default {
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
        if ((0, scale_manager_1.isContinuousScale)(scale)) {
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
exports.default = ScatterPlot;
