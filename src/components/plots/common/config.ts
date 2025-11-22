import * as d3 from 'd3';

export interface ThemeConfig {
    opacity?: number;
    transitionDuration?: number;
    enableZoom?: boolean;
    zoomAreaThreshold?: number;
}

export interface PlotDimensionConfig {
    width?: number | null;
    height?: number | null;
    heightToWidthRatio?: number;
}

export interface PlotMarginConfig {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface DomainConfig {
    paddingX?: number;
    paddingY?: number;
    domainX?: [number, number] | null;
    domainY?: [number, number] | null;
    defaultDomainX?: [number, number];
    defaultDomainY?: [number, number];
}

export interface ScaleConfig {
    logX?: boolean;
    logY?: boolean;
    formatNiceX?: boolean;
    formatNiceY?: boolean;
}

export interface AxisConfig {
    showAxis?: boolean;
    showGrid?: boolean;
    xLabel?: string | null;
    yLabel?: string | null;
    tickCount?: number;
    tickSize?: number;
    tickFormat?: (domainValue: string, index: number) => string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

export interface LegendConfig {
    legendRef?: { current: HTMLDivElement | null };
    title?: string | null;
    maxHeight?: number | null;
    absolutePositions?: {
        top: string;
        right: string;
    };
    categoricalItemHeight?: number;
    continuousBarWidth?: number;
    continuousBarLength?: number;
}

export interface TooltipConfig {
    tooltipRef?: { current: HTMLDivElement | null };
    tooltipClasses?: string[] | null;
    offsetX?: number;
    offsetY?: number;
}

export interface ColorConfig {
    defaultColor?: string;
    categoricalColorScheme?: readonly string[];
    continuousColorScheme?: (t: number) => string;
}

export interface ImmutablePrimitiveConfig {
    // these properties cannot be changed after primitive initialization
    staticElement?: boolean;
    layerName?: string;
    className?: string;
}

export interface MutablePrimitiveConfig<
TFill = string,
TStroke = string,
TStrokeWidth = number,
TOpacity = number,
> {
    fill?: TFill;
    stroke?: TStroke;
    strokeWidth?: TStrokeWidth;
    opacity?: TOpacity;
    coordinateSystem?: 'data' | 'pixel';
    pointerEvents?: 'all' | 'auto' | 'none';
}

export type PrimitiveConfig<
    TFill = string,
    TStroke = string,
    TStrokeWidth = number,
    TOpacity = number
> = ImmutablePrimitiveConfig & MutablePrimitiveConfig<TFill, TStroke, TStrokeWidth, TOpacity>;

export type DataDrivenValue<T> = T | ((d: Record<string, any>) => T);

export type BatchPrimitiveConfig = PrimitiveConfig<
    DataDrivenValue<string>,
    DataDrivenValue<string>,
    DataDrivenValue<number>,
    DataDrivenValue<number>
>;

export interface PlotConfig {
    margin?: PlotMarginConfig;
    dimensions?: PlotDimensionConfig;
    themeConfig?: ThemeConfig;
    domainConfig?: DomainConfig;
    scaleConfig?: ScaleConfig;
    axisConfig?: AxisConfig;
    legendConfig?: LegendConfig;
    tooltipConfig?: TooltipConfig;
    colorConfig?: ColorConfig;
}

export interface RequiredPlotConfig {
    margin: Required<PlotMarginConfig>;
    dimensions: Required<PlotDimensionConfig>;
    themeConfig: Required<ThemeConfig>;
    domainConfig: Required<DomainConfig>;
    scaleConfig: Required<ScaleConfig>;
    axisConfig: Required<AxisConfig>;
    legendConfig: Required<LegendConfig>;
    tooltipConfig: Required<TooltipConfig>;
    colorConfig: Required<ColorConfig>;
}


export function DEFAULT_TICK_FORMAT(d: number | string | Date): string {
    // if (d instanceof Date) {
    //     return null; // let d3 format the date itself
    // }
    if (typeof d === 'string') {
        return d;
    } else if (typeof d === 'number') {
        if (d === 0) {
            return '0';
        } else if (Math.abs(d) >= 1000) {
            return d3.format('.2s')(d);
        }
    }
    return String(d);
}

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
    top: 20,
    bottom: 45,
    left: 55,
    right: 20,
};

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
    showAxis: true,
    showGrid: true,
    xLabel: null,
    yLabel: null,
    tickCount: 5,
    tickSize: 6,
    tickFormat: DEFAULT_TICK_FORMAT,
    labelOffsetX: 6,
    labelOffsetY: 12
};

export const DEFAULT_LEGEND_CONFIG: Required<LegendConfig> = {
    legendRef: { current: null },
    title: null,
    maxHeight: null, // automatically set to plotHeight otherwise
    absolutePositions: {
        // position: absolute; top: 0%; right: 0%;
        top: '0%',
        right: '0%',
    },
    categoricalItemHeight: 20,
    continuousBarWidth: 20,
    continuousBarLength: 200,
};

export const DEFAULT_TOOLTIP_CONFIG: Required<TooltipConfig> = {
    tooltipRef: { current: null },
    tooltipClasses: null,
    offsetX: 20,
    offsetY: -20,
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
