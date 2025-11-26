import React, { Component } from 'react';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';

import PrimitiveManager from '@/components/plots/common/primitives/primitive-manager';
import TooltipManager from '@/components/plots/common/tooltip-manager';
import LegendManager from '@/components/plots/common/legend-manager';
import DomainManager from '@/components/plots/common/domain-manager';
import ScaleManager, {
    D3Scale,
    isContinuousScale,
} from '@/components/plots/common/scale-manager';
import AxisManager from '@/components/plots/common/axis-manager';
import BrushManager from '@/components/plots/common/brush-manager';

import {
    PlotConfig,
    RequiredPlotConfig,
    DEFAULT_PLOT_MARGIN,
    DEFAULT_PLOT_DIMENSIONS,
    DEFAULT_THEME_CONFIG,
    DEFAULT_DOMAIN_CONFIG,
    DEFAULT_SCALE_CONFIG,
    DEFAULT_AXIS_CONFIG,
    DEFAULT_LEGEND_CONFIG,
    DEFAULT_TOOLTIP_CONFIG,
    DEFAULT_COLOR_CONFIG,
} from '@/components/plots/common/config';

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
    xClass?: DataKey<TData>;
    yClass?: DataKey<TData>;
}

export type BasePlotProps<TData extends DataRecord = DataRecord> =
    PrimaryBasePlotProps<TData> & PlotConfig;

export function getPlotConfig(
    config?: Partial<PlotConfig>
): RequiredPlotConfig {
    return {
        margin: { ...DEFAULT_PLOT_MARGIN, ...config?.margin },
        dimensions: { ...DEFAULT_PLOT_DIMENSIONS, ...config?.dimensions },
        themeConfig: { ...DEFAULT_THEME_CONFIG, ...config?.themeConfig },
        domainConfig: { ...DEFAULT_DOMAIN_CONFIG, ...config?.domainConfig },
        scaleConfig: { ...DEFAULT_SCALE_CONFIG, ...config?.scaleConfig },
        axisConfig: { ...DEFAULT_AXIS_CONFIG, ...config?.axisConfig },
        legendConfig: { ...DEFAULT_LEGEND_CONFIG, ...config?.legendConfig },
        tooltipConfig: { ...DEFAULT_TOOLTIP_CONFIG, ...config?.tooltipConfig },
        colorConfig: { ...DEFAULT_COLOR_CONFIG, ...config?.colorConfig },
    };
}

abstract class BasePlot<
    TData extends DataRecord = DataRecord,
> extends Component<BasePlotProps<TData>> {
    config: RequiredPlotConfig;

    width!: number;
    height!: number;
    plotWidth!: number;
    plotHeight!: number;

    scale!: Scale;
    domain!: Domain;

    domainManager!: DomainManager;
    scaleManager!: ScaleManager;
    tooltipManager!: TooltipManager;
    axisManager!: AxisManager;
    brushManager!: BrushManager;
    legendManager!: LegendManager;
    primitiveManager!: PrimitiveManager;

    ref: React.RefObject<HTMLDivElement | null>;
    svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    plotArea!: d3.Selection<SVGGElement, unknown, null, undefined>;
    plot!: d3.Selection<SVGGElement, unknown, null, undefined>;
    interactionSurface!:
        | d3.Selection<d3.BaseType, unknown, null, undefined>
        | d3.Selection<SVGRectElement, unknown, null, undefined>;
    resizeObserver!: ResizeObserver;

    clipPathId: string;
    updateFunctions: Array<() => void>;

    constructor(props: BasePlotProps<TData>) {
        super(props);
        this.config = getPlotConfig(props);
        this.ref = React.createRef<HTMLDivElement>();
        this.clipPathId = 'clip-' + uuidv4();
        this.updateFunctions = [];
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount(): void {
        this.setupResizeObserver();
        if (!this.shouldInitializeChart()) {
            return;
        }
        this.initializeChart();
    }

    componentWillUnmount(): void {
        this.cleanup();

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps: BasePlotProps<TData>): void {
        if (!this.havePropsChanged(prevProps)) {
            return;
        }

        this.config = getPlotConfig(this.props);

        if (this.shouldInitializeChart()) {
            this.initializeChart();
        } else {
            this.cleanup();
        }
    }

    havePropsChanged(prevProps: BasePlotProps<TData>): boolean {
        const keys = new Set<keyof BasePlotProps<TData>>([
            ...(Object.keys(this.props) as Array<keyof BasePlotProps<TData>>),
            ...(Object.keys(prevProps) as Array<keyof BasePlotProps<TData>>),
        ]);

        for (const key of keys) {
            if (this.props[key] !== prevProps[key]) {
                return true;
            }
        }

        return false;
    }

    protected shouldInitializeChart(): boolean {
        // return this.props.data !== undefined && this.props.data.length > 0;
        return true;
    }

    private initializeChart(): void {
        this.cleanup();
        this.initializeProperties();
        this.drawChart();
    }

    private initializeProperties(): void {
        if (!this.ref.current) return;
        const rect = this.ref.current.getBoundingClientRect();
        this.width = this.config.dimensions.width ?? rect.width;
        this.height =
            this.config.dimensions.height ??
            this.width * this.config.dimensions.heightToWidthRatio;

        this.onInitializeProperties();
    }

    private initializePlot(): void {
        d3.select(this.ref.current).selectAll('*').remove();
        d3.select(this.config.legendConfig.legendRef.current)
            .selectAll('*')
            .remove();

        this.plotWidth = Math.max(
            0,
            this.width - this.config.margin.left - this.config.margin.right
        );
        this.plotHeight = Math.max(
            0,
            this.height - this.config.margin.top - this.config.margin.bottom
        );

        this.svg = d3
            .select(this.ref.current)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.svg
            .append('defs')
            .append('svg:clipPath')
            .attr('id', this.clipPathId)
            .append('svg:rect')
            .attr('width', this.plotWidth)
            .attr('height', this.plotHeight);

        this.plotArea = this.svg
            .append('g')
            .attr(
                'transform',
                `translate(${this.config.margin.left},${this.config.margin.top})`
            )
            .attr('class', 'plot-area');

        this.plot = this.plotArea
            .append('g')
            .attr('class', 'plot')
            .attr('clip-path', `url(#${this.clipPathId})`);

        this.onInitializePlot();
    }

    private setupPrimitives(): void {
        this.primitiveManager = new PrimitiveManager(
            this as BasePlot<DataRecord>
        );
    }

    getDefaultDomainX(): Domain['x'] {
        const data = (this.props.data ?? []) as DataRecord[];
        const xValues = this.props.xClass
            ? data.map((d) => d[this.props.xClass!])
            : [];
        return this.domainManager.getDomainX(xValues);
    }

    getDefaultDomainY(): Domain['y'] {
        const data = (this.props.data ?? []) as DataRecord[];
        const yValues = this.props.yClass
            ? data.map((d) => d[this.props.yClass!])
            : [];
        return this.domainManager.getDomainY(yValues);
    }

    getDefaultDomain(): Domain {
        return {
            x: this.getDefaultDomainX(),
            y: this.getDefaultDomainY(),
        };
    }

    getDefaultScaleX(): Scale['x'] {
        return this.scaleManager.getScaleX(this.domain.x, this.plotWidth);
    }

    getDefaultScaleY(): Scale['y'] {
        return this.scaleManager.getScaleY(this.domain.y, this.plotHeight);
    }

    getDefaultScales(): Scale {
        return {
            x: this.getDefaultScaleX(),
            y: this.getDefaultScaleY(),
        };
    }

    protected configureDomainAndScales(): void {
        this.domain = this.getDefaultDomain();
        this.scale = this.getDefaultScales();
    }

    private setupDomainAndScales(): void {
        this.domainManager = new DomainManager(
            this.config.domainConfig,
            this.config.scaleConfig
        );

        this.scaleManager = new ScaleManager(
            this.config.scaleConfig,
            this.config.colorConfig
        );
        this.configureDomainAndScales();
    }

    private setupAxes(): void {
        if (!this.config.axisConfig.showAxis) return;

        this.axisManager = new AxisManager(
            this.plotArea,
            this.plotWidth,
            this.plotHeight,
            this.config.axisConfig
        );

        this.axisManager.setXAxis(this.scale.x as d3.AxisScale<string>);
        this.axisManager.setYAxis(this.scale.y as d3.AxisScale<string>);

        if (this.config.axisConfig.showGrid) {
            this.axisManager.setXGrid();
            this.axisManager.setYGrid();
        }

        const xLabel =
            this.config.axisConfig.xLabel === null
                ? this.props.xClass
                : this.config.axisConfig.xLabel;

        if (xLabel) {
            this.axisManager.setXLabel(xLabel, this.config.margin.bottom);
        }

        const yLabel =
            this.config.axisConfig.yLabel === null
                ? this.props.yClass
                : this.config.axisConfig.yLabel;

        if (yLabel) {
            this.axisManager.setYLabel(yLabel, this.config.margin.left);
        }

        this.addUpdateFunction(() => {
            if (this.config.axisConfig.showGrid) {
                this.axisManager.removeXGrid();
                this.axisManager.removeYGrid();
            }
            this.axisManager.updateXAxis(
                this.scale.x as d3.AxisScale<string>,
                this.config.themeConfig.transitionDuration
            );
            this.axisManager.updateYAxis(
                this.scale.y as d3.AxisScale<string>,
                this.config.themeConfig.transitionDuration
            );
            if (this.config.axisConfig.showGrid) {
                this.axisManager.setXGrid();
                this.axisManager.setYGrid();
            }
        });
    }

    setupBrush(): void {
        if (!this.config.themeConfig.enableZoom) return;

        this.brushManager = new BrushManager(
            this.plot,
            [
                [0, 0],
                [this.plotWidth, this.plotHeight],
            ],
            this.zoomToSelection.bind(this),
            this.resetZoom.bind(this),
            this.config.themeConfig.transitionDuration
        );
    }

    resetZoom(): void {
        this.scaleManager.setScaleDomain(
            this.scale.x,
            this.domain.x,
            this.config.scaleConfig.formatNiceX
        );
        this.scaleManager.setScaleDomain(
            this.scale.y,
            this.domain.y,
            this.config.scaleConfig.formatNiceY
        );
        this.updateChart();
    }

    zoomToSelection(extent: [[number, number], [number, number]]): void {
        if (
            !isContinuousScale(this.scale.x) ||
            !isContinuousScale(this.scale.y)
        ) {
            console.warn('Zooming requires continuous scales');
            return;
        }

        // Check if the selection area is greater than the threshold pixels
        const threshold = this.config.themeConfig.zoomAreaThreshold;
        const shouldZoom =
            Math.abs(extent[1][0] - extent[0][0]) *
                Math.abs(extent[1][1] - extent[0][1]) >
            threshold;

        if (!shouldZoom) return;

        const newXDomain = [
            this.scale.x.invert(extent[0][0]),
            this.scale.x.invert(extent[1][0]),
        ] as [number, number] | [Date, Date];

        const newYDomain = [
            this.scale.y.invert(extent[1][1]),
            this.scale.y.invert(extent[0][1]),
        ] as [number, number] | [Date, Date];

        this.scaleManager.setScaleDomain(this.scale.x, newXDomain, false);
        this.scaleManager.setScaleDomain(this.scale.y, newYDomain, false);

        this.updateChart();
    }

    setupInteractionSurface(): void {
        if (this.brushManager) {
            this.interactionSurface = this.plot
                .select('.brush')
                .select('.overlay');
        } else {
            this.interactionSurface = this.plot
                .append('rect')
                .attr('fill', 'none')
                .attr('width', this.plotWidth)
                .attr('height', this.plotHeight)
                .style('pointer-events', 'all');
        }
        // Ensure that the primitives are in front (have the highest z-index for interactivity)
        if (this.primitiveManager) {
            this.primitiveManager.sortLayers();
        }
    }

    setupLegend(): void {
        if (!this.config.legendConfig.legendRef.current) return;
        this.legendManager = new LegendManager({
            ...this.config.legendConfig,
            maxHeight: this.config.legendConfig.maxHeight ?? this.plotHeight,
        });
        this.drawLegend();
    }

    setupTooltip(): void {
        if (!this.config.tooltipConfig.tooltipRef.current) return;
        this.tooltipManager = new TooltipManager(
            this.config.tooltipConfig,
            this.ref
        );
        this.tooltipManager.hideTooltip();
        this.drawTooltip();
    }

    setupResizeObserver(): void {
        const element = this.ref.current;

        if (!element) {
            console.warn('Ref not available for resize handling');
            return;
        }

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0].contentRect;
                this.updateDimensions(width);
            });
            this.resizeObserver.observe(element);
        } else {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        }
    }

    handleResize(): void {
        if (!this.ref.current) return;
        const { width, height } = this.ref.current.getBoundingClientRect();
        this.updateDimensions(width);
    }

    updateDimensions(containerWidth: number): void {
        if (!this.config.dimensions) return; // Chart not yet initialized

        const newWidth = this.config.dimensions.width ?? containerWidth;
        const newHeight =
            this.config.dimensions.height ??
            newWidth * this.config.dimensions.heightToWidthRatio;

        if (
            Math.round(newWidth) === Math.round(this.width) &&
            Math.round(newHeight) === Math.round(this.height)
        ) {
            return;
        }

        this.width = newWidth;
        this.height = newHeight;

        if (this.shouldInitializeChart()) {
            this.initializeChart();
        }
    }

    getEventCoords(event: Event, coordinateSystem = 'pixel'): [number, number] {
        const [x, y] = d3.pointer(event, this.plot.node());
        if (coordinateSystem === 'data') {
            if (
                !isContinuousScale(this.scale.x) ||
                !isContinuousScale(this.scale.y)
            ) {
                console.warn(
                    'Categorical scales do not support detecting event coordinates in the data coordinate system'
                );
                return [x, y];
            }
            return [this.scale.x.invert(x), this.scale.y.invert(y)] as [
                number,
                number,
            ];
        }
        return [x, y];
    }

    addUpdateFunction(updateFunction: () => void): void {
        this.updateFunctions.push(updateFunction);
    }

    updateChart(): void {
        for (let updateFunction of this.updateFunctions) {
            updateFunction.call(this);
        }
        this.onUpdateChart();
    }

    cleanup(): void {
        if (this.svg) {
            this.svg.selectAll('*').interrupt();
        }
        if (this.tooltipManager) {
            this.tooltipManager.hideTooltip();
        }

        d3.select(this.ref.current).selectAll('*').remove();

        if (this.config.legendConfig?.legendRef?.current) {
            d3.select(this.config.legendConfig.legendRef.current)
                .selectAll('*')
                .remove();
        }

        this.updateFunctions = [];
        this.onCleanup();
    }

    // Main drawing method
    drawChart(): void {
        try {
            this.initializePlot();
            this.setupPrimitives();
            this.setupDomainAndScales();
            this.setupAxes();
            this.setupBrush();
            this.setupInteractionSurface();
            this.draw();
            this.setupLegend();
            this.setupTooltip();
        } catch (error) {
            this.handleDrawError(error);
            this.cleanup();
        }
    }

    // Required hook - to plot objects on the screen
    abstract draw(): void;

    // Lifecycle hooks - to be optionally overridden by subclasses
    onInitializeProperties(): void {}
    onInitializePlot(): void {}
    drawTooltip(): void {}
    drawLegend(): void {}
    onUpdateChart(): void {}
    onCleanup(): void {}
    handleDrawError(error: unknown): void {}

    render() {
        return <div ref={this.ref} style={{ width: '100%' }}></div>;
    }
}

export default BasePlot;
