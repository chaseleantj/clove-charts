import * as d3 from 'd3';
import BasePlot, { BasePlotProps, Scale } from '../common/base-plot';
export interface ContourPlotConfig {
    func: (x: number, y: number) => number;
    resolutionX: number;
    resolutionY: number;
    thresholds: number;
    strokeColor: string;
    shadeContour: boolean;
}
export interface ContourPlotProps extends BasePlotProps, Partial<ContourPlotConfig> {
    func: (x: number, y: number) => number;
}
interface ContourPlotDomain {
    x: [number, number];
    y: [number, number];
    color?: [number, number];
}
interface ContourPlotScale extends Scale {
    color?: d3.ScaleSequential<string, never> | ((t: number) => string);
}
export declare const DEFAULT_CONTOUR_PLOT_CONFIG: Omit<ContourPlotConfig, 'func'>;
declare class ContourPlot extends BasePlot {
    domain: ContourPlotDomain;
    scale: ContourPlotScale;
    props: ContourPlotProps;
    contourPlotConfig: ContourPlotConfig;
    fValues: number[];
    xRange: number[];
    yRange: number[];
    constructor(props: ContourPlotProps);
    onInitializeProperties(): void;
    protected configureDomainAndScales(): void;
    draw(): void;
    drawLegend(): void;
    private linspace;
}
export default ContourPlot;
