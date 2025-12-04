import * as d3 from 'd3';

import {
    ThemeConfig,
    PlotDimensionConfig,
    PlotMarginConfig,
    DomainConfig,
    ScaleConfig,
    AxisConfig,
    LegendConfig,
    TooltipConfig,
    ColorConfig,
    PrimitiveConfig,
} from './index';

export const DEFAULT_THEME_CONFIG: Required<ThemeConfig> = {
    opacity: 1,
    transitionDuration: 500,
    enableZoom: false,
    zoomAreaThreshold: 1000,
};

export const DEFAULT_PLOT_DIMENSIONS: Required<PlotDimensionConfig> = {
    width: null,
    height: null,
    heightToWidthRatio: 0.8,
};

export const DEFAULT_PLOT_MARGIN: Required<PlotMarginConfig> = {
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
} as const;

export const DEFAULT_DOMAIN_CONFIG: Required<DomainConfig> = {
    paddingX: 0.05,
    paddingY: 0.05,
    domainX: null,
    domainY: null,
    defaultDomainX: [0, 1],
    defaultDomainY: [0, 1],
};

export const DEFAULT_SCALE_CONFIG: Required<ScaleConfig> = {
    logX: false,
    logY: false,
    formatNiceX: true,
    formatNiceY: true,
};

export const DEFAULT_AXIS_CONFIG: Required<AxisConfig> = {
    showAxisX: true,
    showAxisY: true,
    showGridX: true,
    showGridY: true,
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
        } else if (Math.abs(d) >= 1000) {
            return d3.format('.2s')(d);
        }
        return String(d);
    },
    labelOffsetX: 6,
    labelOffsetY: 12,
};

export const DEFAULT_LEGEND_CONFIG: Required<LegendConfig> = {
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

export const DEFAULT_TOOLTIP_CONFIG: Required<TooltipConfig> = {
    enabled: true,
    tooltipKeys: null,
    offsetX: 15,
    offsetY: -15,
    valueFormatter: null,
    edgePadding: 10,
};

export const DEFAULT_COLOR_CONFIG: Required<ColorConfig> = {
    defaultColor: 'steelblue',
    categoricalColorScheme: d3.schemeTableau10,
    continuousColorScheme: d3.interpolateViridis,
};

export const DEFAULT_PRIMITIVE_CONFIG: Required<PrimitiveConfig> = {
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
