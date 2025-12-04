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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PRIMITIVE_CONFIG = exports.DEFAULT_COLOR_CONFIG = exports.DEFAULT_TOOLTIP_CONFIG = exports.DEFAULT_LEGEND_CONFIG = exports.DEFAULT_AXIS_CONFIG = exports.DEFAULT_SCALE_CONFIG = exports.DEFAULT_DOMAIN_CONFIG = exports.MARGIN_PRESETS = exports.DEFAULT_PLOT_MARGIN = exports.DEFAULT_PLOT_DIMENSIONS = exports.DEFAULT_THEME_CONFIG = void 0;
const d3 = __importStar(require("d3"));
exports.DEFAULT_THEME_CONFIG = {
    opacity: 1,
    transitionDuration: 500,
    enableZoom: false,
    zoomAreaThreshold: 1000,
};
exports.DEFAULT_PLOT_DIMENSIONS = {
    width: null,
    height: null,
    heightToWidthRatio: 0.8,
};
exports.DEFAULT_PLOT_MARGIN = {
    top: 10,
    bottom: 45,
    left: 55,
    right: 20,
    auto: true,
};
exports.MARGIN_PRESETS = {
    top: exports.DEFAULT_PLOT_MARGIN.top,
    bottom: exports.DEFAULT_PLOT_MARGIN.bottom,
    left: exports.DEFAULT_PLOT_MARGIN.left,
    right: exports.DEFAULT_PLOT_MARGIN.right,
    bottomNoLabel: 30,
    leftNoLabel: 40,
    rightWithLegend: 90,
};
exports.DEFAULT_DOMAIN_CONFIG = {
    paddingX: 0.05,
    paddingY: 0.05,
    domainX: null,
    domainY: null,
    defaultDomainX: [0, 1],
    defaultDomainY: [0, 1],
};
exports.DEFAULT_SCALE_CONFIG = {
    logX: false,
    logY: false,
    formatNiceX: true,
    formatNiceY: true,
};
exports.DEFAULT_AXIS_CONFIG = {
    showAxis: true,
    showGrid: true,
    xLabel: null,
    yLabel: null,
    tickCount: 5,
    tickSize: 6,
    tickFormatX: null,
    tickFormatY: null,
    defaultStringFormat: (d) => d,
    defaultNumberFormat: (d) => {
        if (d === 0) {
            return '0';
        }
        else if (Math.abs(d) >= 1000) {
            return d3.format('.2s')(d);
        }
        return String(d);
    },
    labelOffsetX: 6,
    labelOffsetY: 12,
};
exports.DEFAULT_LEGEND_CONFIG = {
    enabled: false,
    title: null,
    maxHeight: null, // automatically set to plotHeight otherwise
    absolutePositions: {
        top: '25px',
        right: '10px',
        bottom: undefined,
        left: undefined,
    },
    categoricalItemHeight: 20,
    continuousBarWidth: 20,
    continuousBarLength: 150,
};
exports.DEFAULT_TOOLTIP_CONFIG = {
    enabled: true,
    tooltipKeys: null,
    offsetX: 15,
    offsetY: -15,
    valueFormatter: null,
    edgePadding: 10,
};
exports.DEFAULT_COLOR_CONFIG = {
    defaultColor: 'steelblue',
    categoricalColorScheme: d3.schemeTableau10,
    continuousColorScheme: d3.interpolateViridis,
};
exports.DEFAULT_PRIMITIVE_CONFIG = {
    fill: 'steelblue',
    stroke: 'currentColor',
    strokeWidth: 1,
    opacity: 1,
    coordinateSystem: 'data',
    pointerEvents: 'none',
    staticElement: false,
    layerName: 'default',
    className: 'primitive',
};
