import * as d3 from 'd3';
import BasePlot, { BasePlotProps, DataKey, Scale } from '../common/base-plot';
export interface MatrixPlotConfig {
    padding: number;
    showGrid: boolean;
    showCellLabel: boolean;
}
export interface MatrixPlotProps<TData extends Record<string, any> = Record<string, any>> extends BasePlotProps<TData>, Partial<MatrixPlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKey: DataKey<TData>;
    valueKey: DataKey<TData>;
}
export interface MatrixPlotDomain {
    x: string[];
    y: string[];
    color?: [number, number] | [Date, Date] | string[];
}
interface MatrixPlotScale extends Scale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleBand<string>;
    color?: d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string>;
}
export declare const DEFAULT_MATRIX_PLOT_CONFIG: Partial<MatrixPlotConfig>;
export declare function getMatrixPlotConfig<TData extends Record<string, any>>(props: MatrixPlotProps<TData>): MatrixPlotConfig;
declare class MatrixPlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    domain: MatrixPlotDomain;
    scale: MatrixPlotScale;
    props: MatrixPlotProps<TData>;
    matrixPlotConfig: MatrixPlotConfig;
    constructor(props: MatrixPlotProps<TData>);
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    draw(): void;
    drawLegend(): void;
}
export default MatrixPlot;
