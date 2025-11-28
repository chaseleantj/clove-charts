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
    auto?: boolean;
}

export interface DomainConfig {
    paddingX?: number;
    paddingY?: number;
    domainX?: [number, number] | [string, string] | [Date, Date] | null;
    domainY?: [number, number] | [string, string] | [Date, Date] | null;
    defaultDomainX?: [number, number] | [string, string] | [Date, Date];
    defaultDomainY?: [number, number] | [string, string] | [Date, Date];
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
    tickFormatX?:
        | ((domainValue: any, index: number) => string)
        | ((domainValue: any) => string)
        | null;
    tickFormatY?:
        | ((domainValue: any, index: number) => string)
        | ((domainValue: any) => string)
        | null;
    defaultStringFormat?: (domainValue: string) => string;
    defaultNumberFormat?: (domainValue: number) => string;
    labelOffsetX?: number;
    labelOffsetY?: number;
}

export interface LegendConfig {
    enabled?: boolean;
    title?: string | null;
    maxHeight?: number | null;
    absolutePositions?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    categoricalItemHeight?: number;
    continuousBarWidth?: number;
    continuousBarLength?: number;
}

export type TooltipValueFormatter = (value: unknown, key: string) => string;

export interface TooltipConfig {
    enabled?: boolean;
    tooltipKeys?: string[] | null;
    offsetX?: number;
    offsetY?: number;
    valueFormatter?: TooltipValueFormatter | null;
    edgePadding?: number;
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
    TOpacity = number,
> = ImmutablePrimitiveConfig &
    MutablePrimitiveConfig<TFill, TStroke, TStrokeWidth, TOpacity>;

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

// Re-export defaults for convenience
export * from './defaults';
