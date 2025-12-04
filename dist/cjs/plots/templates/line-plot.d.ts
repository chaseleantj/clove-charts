import * as d3 from 'd3';
import BasePlot, { BasePlotProps, DataKey, Scale } from '../common/base-plot';
import { LinePrimitive, PointPrimitive } from '../common/primitives/primitives';
export interface LinePlotConfig {
    lineWidth: number;
    lineOpacity: number;
    lineLabelWidth: number;
    lineLabelColor: string;
}
export interface LinePlotProps<TData extends Record<string, any> = Record<string, any>> extends Omit<BasePlotProps<TData>, 'yKey'>, Partial<LinePlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKeys: DataKey<TData>[];
}
interface LinePlotScale extends Scale {
    color?: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string, never>;
}
export declare const DEFAULT_LINE_PLOT_CONFIG: LinePlotConfig;
declare class LinePlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    props: LinePlotProps<TData>;
    linePlotConfig: LinePlotConfig;
    scale: LinePlotScale;
    lineLabel: LinePrimitive;
    pointLabels: Record<string, PointPrimitive>;
    constructor(props: LinePlotProps<TData>);
    shouldInitializeChart(): boolean;
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    draw(): void;
    drawLegend(): void;
    setupLabels(): void;
    updateLabels(event: any): void;
    locateNearestDataPoint(event: any, className: string): number;
    drawTooltip(): void;
    hideTooltip(): void;
    onSetupBrush(): void;
}
export default LinePlot;
