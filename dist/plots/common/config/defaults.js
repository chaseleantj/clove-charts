import * as d3 from 'd3';
export const DEFAULT_THEME_CONFIG = {
    opacity: 1,
    transitionDuration: 500,
    enableZoom: false,
    zoomAreaThreshold: 1000,
};
export const DEFAULT_PLOT_DIMENSIONS = {
    width: null,
    height: null,
    heightToWidthRatio: 0.8,
};
export const DEFAULT_PLOT_MARGIN = {
    top: 10,
    bottom: 45,
    left: 55,
    right: 20,
    auto: true,
};
export const MARGIN_PRESETS = {
    top: DEFAULT_PLOT_MARGIN.top,
    bottom: DEFAULT_PLOT_MARGIN.bottom,
    left: DEFAULT_PLOT_MARGIN.left,
    right: DEFAULT_PLOT_MARGIN.right,
    bottomNoLabel: 30,
    leftNoLabel: 40,
    rightWithLegend: 90,
};
export const DEFAULT_DOMAIN_CONFIG = {
    paddingX: 0.05,
    paddingY: 0.05,
    domainX: null,
    domainY: null,
    defaultDomainX: [0, 1],
    defaultDomainY: [0, 1],
};
export const DEFAULT_SCALE_CONFIG = {
    logX: false,
    logY: false,
    formatNiceX: true,
    formatNiceY: true,
};
export const DEFAULT_AXIS_CONFIG = {
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
export const DEFAULT_LEGEND_CONFIG = {
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
export const DEFAULT_TOOLTIP_CONFIG = {
    enabled: true,
    tooltipKeys: null,
    offsetX: 15,
    offsetY: -15,
    valueFormatter: null,
    edgePadding: 10,
};
export const DEFAULT_COLOR_CONFIG = {
    defaultColor: 'steelblue',
    categoricalColorScheme: d3.schemeTableau10,
    continuousColorScheme: d3.interpolateViridis,
};
export const DEFAULT_PRIMITIVE_CONFIG = {
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
