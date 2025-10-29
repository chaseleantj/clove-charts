import * as d3 from 'd3'

const defaultFontSize = 14
const smallFontSize = 12

export function DEFAULT_TICK_FORMAT(d) {
    if (d === 0) {
        return '0'
    }
    const absD = Math.abs(d)
    if (absD >= 1) {
        return d3.format('.2s')(d)
    }
    return d3.format('.2g')(d)
}

export const DEFAULT_THEME_CONFIG = {
    fontSize: defaultFontSize,
    smallFontSize: smallFontSize,
    transitionDuration: 500,
    enableZoom: false,
    zoomAreaThreshold: 1000,
}

export const DEFAULT_PLOT_DIMENSIONS = {
    width: null,
    height: null,
    heightToWidthRatio: 0.8,
}

export const DEFAULT_PLOT_MARGIN = {
    top: 20,
    bottom: 45,
    left: 55,
    right: 20,
}

export const DEFAULT_DOMAIN_CONFIG = {
    paddingX: 0.05,
    paddingY: 0.05,
    defaultDomainX: [0, 1],
    defaultDomainY: [0, 1],
}

export const DEFAULT_SCALE_CONFIG = {
    logX: false,
    logY: false,
    formatNiceX: true,
    formatNiceY: true,
}

export const DEFAULT_AXIS_CONFIG = {
    showAxis: true,
    showGrid: true,
    xLabel: null,
    yLabel: null,
    tickCount: 5,
    tickSize: 6,
    tickFontSize: smallFontSize,
    tickFormat: DEFAULT_TICK_FORMAT,
    gridColor: 'light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))',
}

export const DEFAULT_LEGEND_CONFIG = {
    legendRef: { current: null },
    title: null,
    maxHeight: null, // automatically set to plotHeight otherwise
    absolutePositions: {
        // position: absolute; top: 0%; right: 0%;
        top: '0%',
        right: '0%',
    },
    titleFontSize: defaultFontSize,
    fontSize: smallFontSize,
    categoricalItemHeight: 20,
    continuousBarWidth: 20,
    continuousBarLength: 200,
}

export const DEFAULT_TOOLTIP_CONFIG = {
    tooltipRef: { current: null },
    tooltipClasses: null,
    offsetX: 20,
    offsetY: -20,
}

export const DEFAULT_COLOR_CONFIG = {
    defaultColor: 'steelblue',
    categoricalColorScheme: d3.schemeTableau10,
    continuousColorScheme: d3.interpolateViridis,
}

export const DEFAULT_PRIMITIVE_CONFIG = {
    fill: 'currentColor',
    stroke: 'currentColor',
    pointerEvents: 'none',
    coordinateSystem: 'data',
    staticElement: false,
    layerName: 'default',
    opacity: 1,
}
