import * as d3 from 'd3';

import {
    // TickFormatFunction,
    CoordinateSystem,
} from '@/components/plots/common/types';

export interface ThemeConfig {
    fontSize?: number;
    smallFontSize?: number;
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
    tickFontSize?: number;
    tickFormat?: (domainValue: string, index: number) => string;
    gridColor?: string;
}

export interface LegendConfig {
    legendRef?: { current: HTMLDivElement | null };
    title?: string | null;
    maxHeight?: number | null;
    absolutePositions?: {
        top: string;
        right: string;
    };
    titleFontSize?: number;
    fontSize?: number;
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

export interface PrimitiveConfig<
    TFill = string,
    TStroke = string,
    TStrokeWidth = number,
    TOpacity = number,
> {
    fill?: TFill;
    stroke?: TStroke;
    strokeWidth?: TStrokeWidth;
    pointerEvents?: string;
    coordinateSystem?: CoordinateSystem;
    staticElement?: boolean;
    layerName?: string;
    opacity?: TOpacity;
    className?: string;
}

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

const DEFAULT_FONT_SIZE = 14;
const SMALL_FONT_SIZE = 12;
const DEFAULT_COLOR = 'steelblue';

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
    fontSize: DEFAULT_FONT_SIZE,
    smallFontSize: SMALL_FONT_SIZE,
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
    tickFontSize: SMALL_FONT_SIZE,
    tickFormat: DEFAULT_TICK_FORMAT,
    gridColor: 'light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))',
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
    titleFontSize: DEFAULT_FONT_SIZE,
    fontSize: SMALL_FONT_SIZE,
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
    defaultColor: DEFAULT_COLOR,
    categoricalColorScheme: d3.schemeTableau10,
    continuousColorScheme: d3.interpolateViridis,
};

export const DEFAULT_PRIMITIVE_CONFIG: Required<PrimitiveConfig> = {
    fill: DEFAULT_COLOR,
    stroke: 'currentColor',
    strokeWidth: 1,
    pointerEvents: 'none',
    coordinateSystem: CoordinateSystem.Data,
    staticElement: false,
    layerName: 'default',
    opacity: 1,
    className: 'primitive',
};
