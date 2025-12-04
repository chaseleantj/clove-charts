import * as d3 from 'd3';
import BasePlot, { BasePlotProps, DataKey, Scale } from '../common/base-plot';
import { RequiredPlotConfig } from '../common/config';
import { BatchPointsPrimitive } from '../common/primitives/primitives';
export interface ScatterPlotConfig<TData extends Record<string, any> = Record<string, any>> {
    pointSize: number | ((d: TData) => number);
    pointOpacity: number | ((d: TData) => number);
    colorKey: DataKey<TData> | null;
    symbolType: d3.SymbolType;
}
export interface ScatterPlotProps<TData extends Record<string, any> = Record<string, any>> extends BasePlotProps<TData>, Partial<ScatterPlotConfig<TData>> {
    data: TData[];
    xKey: DataKey<TData>;
    yKey: DataKey<TData>;
}
interface ScatterPlotDomain {
    x: [number, number] | [Date, Date] | string[];
    y: [number, number] | [Date, Date] | string[];
    color?: [number, number] | [Date, Date] | string[];
}
interface ScatterPlotScale extends Scale {
    color?: d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string>;
}
export declare const DEFAULT_SCATTER_PLOT_CONFIG: {
    pointSize: number;
    colorKey: null;
    symbolType: d3.SymbolType;
};
export declare function getScatterPlotConfig<TData extends Record<string, any>>(props: ScatterPlotProps<TData>, themeConfig: RequiredPlotConfig['themeConfig']): ScatterPlotConfig<TData>;
declare class ScatterPlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    dataPoints: BatchPointsPrimitive;
    domain: ScatterPlotDomain;
    scale: ScatterPlotScale;
    props: ScatterPlotProps<TData>;
    scatterPlotConfig: ScatterPlotConfig<TData>;
    constructor(props: ScatterPlotProps<TData>);
    shouldInitializeChart(): boolean;
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    private getCoordinateAccessor;
    draw(): void;
    drawLegend(): void;
    drawTooltip(): void;
}
export default ScatterPlot;
