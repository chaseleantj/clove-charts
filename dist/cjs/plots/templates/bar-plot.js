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
exports.DEFAULT_BAR_PLOT_CONFIG = void 0;
const d3 = __importStar(require("d3"));
const base_plot_1 = __importDefault(require("../common/base-plot"));
const utils_1 = require("../common/utils");
exports.DEFAULT_BAR_PLOT_CONFIG = {
    padding: 0.2,
    useDifferentColors: true,
};
class BarPlot extends base_plot_1.default {
    constructor(props) {
        super(props);
    }
    onInitializeProperties() {
        this.barPlotConfig = (0, utils_1.mergeWithDefaults)(exports.DEFAULT_BAR_PLOT_CONFIG, this.props);
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
exports.default = BarPlot;
