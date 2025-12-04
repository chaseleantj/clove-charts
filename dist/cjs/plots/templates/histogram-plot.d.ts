import * as d3 from 'd3';
import BasePlot, { BasePlotProps, DataKey } from '../common/base-plot';
export interface HistogramPlotConfig {
    numBins: number;
    barPadding: number;
}
export declare const DEFAULT_HISTOGRAM_PLOT_CONFIG: HistogramPlotConfig;
interface HistogramPlotProps<TData extends Record<string, any> = Record<string, any>> extends Omit<BasePlotProps<TData>, 'yKey'>, Partial<HistogramPlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
}
interface HistogramPlotDomain {
    x: [number, number];
    y: [number, number];
}
declare class HistogramPlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    bins: d3.Bin<number, number>[];
    domain: HistogramPlotDomain;
    props: HistogramPlotProps<TData>;
    histogramPlotConfig: HistogramPlotConfig;
    constructor(props: HistogramPlotProps<TData>);
    shouldInitializeChart(): boolean;
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    draw(): void;
}
export default HistogramPlot;
