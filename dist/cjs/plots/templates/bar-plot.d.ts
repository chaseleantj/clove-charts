import * as d3 from 'd3';
import BasePlot, { BasePlotProps, DataKey } from '../common/base-plot';
export interface BarPlotConfig {
    padding: number;
    useDifferentColors: boolean;
}
export interface BarPlotProps<TData extends Record<string, any> = Record<string, any>> extends BasePlotProps<TData>, Partial<BarPlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKey: DataKey<TData>;
}
interface BarPlotScale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
    color?: d3.ScaleOrdinal<string, string>;
}
interface BarPlotDomain {
    x: string[];
    y: [number, number];
}
export declare const DEFAULT_BAR_PLOT_CONFIG: BarPlotConfig;
declare class BarPlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    domain: BarPlotDomain;
    scale: BarPlotScale;
    props: BarPlotProps<TData>;
    barPlotConfig: BarPlotConfig;
    constructor(props: BarPlotProps<TData>);
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    draw(): void;
}
export default BarPlot;
