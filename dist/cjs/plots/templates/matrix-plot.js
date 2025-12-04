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
exports.DEFAULT_MATRIX_PLOT_CONFIG = void 0;
exports.getMatrixPlotConfig = getMatrixPlotConfig;
const d3 = __importStar(require("d3"));
const base_plot_1 = __importDefault(require("../common/base-plot"));
exports.DEFAULT_MATRIX_PLOT_CONFIG = {
    padding: 0.05,
    showGrid: false,
    showCellLabel: true,
};
function getMatrixPlotConfig(props) {
    var _a, _b, _c;
    return {
        padding: (_a = props.padding) !== null && _a !== void 0 ? _a : exports.DEFAULT_MATRIX_PLOT_CONFIG.padding,
        showGrid: (_b = props.showGrid) !== null && _b !== void 0 ? _b : exports.DEFAULT_MATRIX_PLOT_CONFIG.showGrid,
        showCellLabel: (_c = props.showCellLabel) !== null && _c !== void 0 ? _c : exports.DEFAULT_MATRIX_PLOT_CONFIG.showCellLabel,
    };
}
class MatrixPlot extends base_plot_1.default {
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
exports.default = MatrixPlot;
