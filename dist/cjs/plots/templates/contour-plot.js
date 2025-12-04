"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONTOUR_PLOT_CONFIG = void 0;
const base_plot_1 = __importDefault(require("../common/base-plot"));
const utils_1 = require("../common/utils");
exports.DEFAULT_CONTOUR_PLOT_CONFIG = {
    resolutionX: 32,
    resolutionY: 32,
    thresholds: 10,
    strokeColor: 'currentColor',
    shadeContour: true,
};
class ContourPlot extends base_plot_1.default {
    constructor(props) {
        super(props);
        // Initialize with props.func since it's required (has no default)
        this.contourPlotConfig = {
            func: props.func,
            ...(0, utils_1.mergeWithDefaults)(exports.DEFAULT_CONTOUR_PLOT_CONFIG, props),
        };
        this.fValues = [];
        this.xRange = [];
        this.yRange = [];
    }
    onInitializeProperties() {
        this.contourPlotConfig = {
            func: this.props.func,
            ...(0, utils_1.mergeWithDefaults)(exports.DEFAULT_CONTOUR_PLOT_CONFIG, this.props),
        };
    }
    configureDomainAndScales() {
        this.domain = {
            x: this.domainManager.getDomainX(),
            y: this.domainManager.getDomainY(),
        };
        this.scale = this.getDefaultScales();
        // Calculate padding equal to one threshold step
        const xPadding = (this.domain.x[1] - this.domain.x[0]) /
            this.contourPlotConfig.thresholds;
        const yPadding = (this.domain.y[1] - this.domain.y[0]) /
            this.contourPlotConfig.thresholds;
        // Generate grid points with padding to avoid rendering artifacts at the edges
        this.xRange = this.linspace(this.domain.x[0] - xPadding, this.domain.x[1] + xPadding, this.contourPlotConfig.resolutionX);
        this.yRange = this.linspace(this.domain.y[0] - yPadding, this.domain.y[1] + yPadding, this.contourPlotConfig.resolutionY);
        this.fValues = [];
        for (let j = 0; j < this.contourPlotConfig.resolutionY; j++) {
            for (let i = 0; i < this.contourPlotConfig.resolutionX; i++) {
                this.fValues.push(this.contourPlotConfig.func(this.xRange[i], this.yRange[j]));
            }
        }
        if (this.contourPlotConfig.shadeContour) {
            this.domain.color = this.domainManager.getDomain(this.fValues);
            this.scale.color = this.scaleManager.getColorScale(this.domain.color);
        }
    }
    draw() {
        var _a;
        this.primitiveManager.addContour(this.fValues, this.xRange, this.yRange, {
            colorScale: (_a = this.scale.color) !== null && _a !== void 0 ? _a : undefined,
            thresholds: this.contourPlotConfig.thresholds,
            stroke: this.contourPlotConfig.strokeColor,
        });
    }
    drawLegend() {
        if (this.config.legendConfig.title) {
            this.legendManager.setTitle(this.config.legendConfig.title);
        }
        if (this.contourPlotConfig.shadeContour) {
            this.legendManager.addContinuousLegend(this.scale.color);
        }
    }
    linspace(start, end, num) {
        return Array.from({ length: num }, (_, i) => start + (end - start) * (i / (num - 1)));
    }
}
exports.default = ContourPlot;
