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
exports.DEFAULT_HISTOGRAM_PLOT_CONFIG = void 0;
const d3 = __importStar(require("d3"));
const base_plot_1 = __importDefault(require("../common/base-plot"));
const utils_1 = require("../common/utils");
exports.DEFAULT_HISTOGRAM_PLOT_CONFIG = {
    numBins: 10,
    barPadding: 0.025,
};
class HistogramPlot extends base_plot_1.default {
    constructor(props) {
        super(props);
        this.bins = [];
    }
    shouldInitializeChart() {
        return this.props.data.length > 0;
    }
    onInitializeProperties() {
        this.histogramPlotConfig = (0, utils_1.mergeWithDefaults)(exports.DEFAULT_HISTOGRAM_PLOT_CONFIG, this.props);
    }
    configureDomainAndScales() {
        let domainX = this.getDefaultDomainX();
        if (this.config.scaleConfig.logX) {
            domainX = [
                Math.log10(this.domain.x[0]),
                Math.log10(this.domain.x[1]),
            ];
        }
        const scaleX = this.scaleManager.getScale(domainX, [0, this.plotWidth], 
        // For histograms, the x-scale is always linear after domain adjustment for logX
        false, this.config.scaleConfig.formatNiceX);
        const histogramGenerator = d3
            .bin()
            .domain(scaleX.domain())
            .thresholds(scaleX.ticks(this.histogramPlotConfig.numBins));
        const data = this.props.data.map((d) => {
            return this.config.scaleConfig.logX
                ? Math.log10(d[this.props.xKey])
                : d[this.props.xKey];
        });
        this.bins = histogramGenerator(data);
        const yMax = d3.max(this.bins, (d) => d.length);
        let domainY = this.config.scaleConfig.logY
            ? [1, Math.max(1, yMax)]
            : [0, yMax];
        const scaleY = this.scaleManager.getScale(domainY, [this.plotHeight, 0], this.config.scaleConfig.logY, this.config.scaleConfig.formatNiceY);
        this.domain = {
            x: domainX,
            y: domainY,
        };
        this.scale = {
            x: scaleX,
            y: scaleY,
        };
    }
    draw() {
        const data = this.bins
            .filter((binData) => binData.length > 0)
            .map((binData) => {
            var _a, _b, _c, _d;
            const x0 = (_b = (_a = binData.x0) !== null && _a !== void 0 ? _a : binData.x1) !== null && _b !== void 0 ? _b : 0;
            const x1 = (_d = (_c = binData.x1) !== null && _c !== void 0 ? _c : binData.x0) !== null && _d !== void 0 ? _d : x0;
            const pad = this.histogramPlotConfig.barPadding * (x1 - x0);
            return {
                x1: x0 + pad,
                y1: binData.length,
                x2: x1 - pad,
                y2: this.domain.y[0],
            };
        });
        this.primitiveManager.addRectangles(data, (d) => d.x1, (d) => d.y1, (d) => d.x2, (d) => d.y2, {
            fill: this.config.colorConfig.defaultColor,
            opacity: this.config.themeConfig.opacity,
        });
    }
}
exports.default = HistogramPlot;
