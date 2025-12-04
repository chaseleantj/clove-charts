import React, { Component } from 'react';
import * as d3 from 'd3';
import PrimitiveManager from './primitives/primitive-manager';
import TooltipManager from './tooltip-manager';
import LegendManager from './legend-manager';
import DomainManager from './domain-manager';
import ScaleManager, { D3Scale } from './scale-manager';
import AxisManager from './axis-manager';
import BrushManager from './brush-manager';
import { PlotConfig, PlotMarginConfig, RequiredPlotConfig } from './config';
export interface Domain {
    x: [number, number] | [Date, Date] | string[];
    y: [number, number] | [Date, Date] | string[];
}
export interface Scale {
    x: D3Scale;
    y: D3Scale;
}
export type DataRecord = Record<string, any>;
export type DataKey<T extends DataRecord> = Extract<keyof T, string>;
interface PrimaryBasePlotProps<TData extends DataRecord = DataRecord> {
    data?: TData[];
    xKey?: DataKey<TData>;
    yKey?: DataKey<TData>;
}
export type BasePlotProps<TData extends DataRecord = DataRecord> = PrimaryBasePlotProps<TData> & PlotConfig;
export declare function getPlotConfig(config?: Partial<PlotConfig>): RequiredPlotConfig;
declare abstract class BasePlot<TData extends DataRecord = DataRecord> extends Component<BasePlotProps<TData>, {
    isVisible: boolean;
}> {
    config: RequiredPlotConfig;
    state: {
        isVisible: boolean;
    };
    width: number;
    height: number;
    plotWidth: number;
    plotHeight: number;
    scale: Scale;
    domain: Domain;
    domainManager: DomainManager;
    scaleManager: ScaleManager;
    tooltipManager: TooltipManager;
    axisManager: AxisManager;
    brushManager: BrushManager;
    legendManager: LegendManager;
    primitiveManager: PrimitiveManager;
    wrapperRef: React.RefObject<HTMLDivElement | null>;
    ref: React.RefObject<HTMLDivElement | null>;
    legendRef: React.RefObject<HTMLDivElement | null>;
    tooltipRef: React.RefObject<HTMLDivElement | null>;
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    plotArea: d3.Selection<SVGGElement, unknown, null, undefined>;
    plot: d3.Selection<SVGGElement, unknown, null, undefined>;
    interactionSurface: d3.Selection<d3.BaseType, unknown, null, undefined> | d3.Selection<SVGRectElement, unknown, null, undefined>;
    resizeObserver: ResizeObserver;
    clipPathId: string;
    updateFunctions: Array<() => void>;
    constructor(props: BasePlotProps<TData>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: BasePlotProps<TData>): void;
    havePropsChanged(prevProps: BasePlotProps<TData>): boolean;
    protected shouldInitializeChart(): boolean;
    private initializeChart;
    private initializeProperties;
    private applyAutoMargins;
    protected calculateAutoMargins(domainX: Domain['x'], domainY: Domain['y']): Partial<Required<PlotMarginConfig>>;
    private initializePlot;
    private setupPrimitives;
    getDefaultDomainX(): Domain['x'];
    getDefaultDomainY(): Domain['y'];
    getDefaultDomain(): Domain;
    getDefaultScaleX(): Scale['x'];
    getDefaultScaleY(): Scale['y'];
    getDefaultScales(): Scale;
    protected configureDomainAndScales(): void;
    private setupAxes;
    setupBrush(): void;
    resetZoom(): void;
    zoomToSelection(extent: [[number, number], [number, number]]): void;
    setupInteractionSurface(): void;
    setupLegend(): void;
    setupTooltip(): void;
    setupResizeObserver(): void;
    handleResize(): void;
    updateDimensions(containerWidth: number): void;
    getEventCoords(event: Event, coordinateSystem?: string): [number, number];
    addUpdateFunction(updateFunction: () => void): void;
    updateChart(): void;
    cleanup(): void;
    drawChart(): void;
    abstract draw(): void;
    onInitializeProperties(): void;
    onInitializePlot(): void;
    drawTooltip(): void;
    drawLegend(): void;
    onUpdateChart(): void;
    onCleanup(): void;
    handleDrawError(error: unknown): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default BasePlot;
