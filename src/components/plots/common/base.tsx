import React, { Component } from 'react';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';

import PrimitiveManager from '@/components/plots/common/primitive-manager';
import TooltipManager from '@/components/plots/common/tooltip-manager';
import LegendManager from '@/components/plots/common/legend-manager';
import DomainManager from '@/components/plots/common/domain-manager';
import ScaleManager, {
    AnyD3Scale,
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
    CoordinateSystem,
} from '@/components/plots/common/config';

interface Scale {
    x: AnyD3Scale;
    y: AnyD3Scale;
    color:
        | d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
        | (() => string);
}

interface Domain {
    x: [number, number] | [Date, Date] | string[];
    y: [number, number] | [Date, Date] | string[];
}

interface PrimaryBasePlotProps {
    data?: Record<string, any>[];
    xClass?: string;
    yClass?: string;
    domainX?: [number, number];
    domainY?: [number, number];
}

type BasePlotProps = PrimaryBasePlotProps & PlotConfig;

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

class BasePlot extends Component<BasePlotProps> {
    config: RequiredPlotConfig;

    width!: number;
    height!: number;
    plotWidth!: number;
    plotHeight!: number;

    scale!: Scale;
    domain!: Domain;

    domainManager!: DomainManager<Record<string, any>>;
    scaleManager!: ScaleManager;
    tooltipManager!: TooltipManager;

    axes!: AxisManager;
    legend!: LegendManager;
    brush!: BrushManager;
    primitives!: PrimitiveManager;

    ref: React.RefObject<HTMLDivElement | null>;
    svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    clip!: d3.Selection<d3.BaseType, unknown, null, undefined>;
    plotArea!: d3.Selection<SVGGElement, unknown, null, undefined>;
    plot!: d3.Selection<SVGGElement, unknown, null, undefined>;
    interactionSurface!:
        | d3.Selection<d3.BaseType, unknown, null, undefined>
        | d3.Selection<SVGRectElement, unknown, null, undefined>;

    clipPathId: string;
    updateFunctions: Array<() => void>;
    resizeObserver!: ResizeObserver;

    constructor(props: BasePlotProps) {
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

    componentDidUpdate(prevProps: BasePlotProps): void {
        const propsChanged = (
            Object.keys(this.props) as Array<keyof BasePlotProps>
        ).some((prop) => this.props[prop] !== prevProps[prop]);
        if (propsChanged) {
            if (this.shouldInitializeChart()) {
                this.initializeChart();
            } else {
                this.cleanup();
            }
        }
    }

    shouldInitializeChart(): boolean {
        return this.props.data !== undefined && this.props.data.length > 0;
    }

    initializeChart(): void {
        this.initializeProperties();
        this.drawChart();
    }

    initializeProperties(): void {
        if (!this.ref.current) return;
        const rect = this.ref.current.getBoundingClientRect();
        this.width = this.config.dimensions.width ?? rect.width;
        this.height =
            this.config.dimensions.height ??
            this.width * this.config.dimensions.heightToWidthRatio;

        this.onInitializeProperties();
    }

    initializePrimitives(): void {
        this.primitives = new PrimitiveManager(this);
        this.onInitializePrimitives();
    }

    initializePlot(): void {
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

        this.clip = this.svg
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

    setupDomain(): void {
        this.domainManager = new DomainManager(
            this.props.data as Record<string, any>[]
        );

        // x domain configuration
        if (this.props.domainX) {
            this.domain.x = this.props.domainX;
        } else if (this.props.xClass) {
            const xClass = this.props.xClass;
            const paddingX = this.config.scaleConfig.logX
                ? 0
                : this.config.domainConfig.paddingX;
            this.domain.x = this.domainManager.getDomain(
                (d) => d[xClass],
                paddingX
            );
        } else {
            this.domain.x = this.config.domainConfig.defaultDomainX;
        }

        // y domain configuration
        if (this.props.domainY) {
            this.domain.y = this.props.domainY;
        } else if (this.props.yClass) {
            const yClass = this.props.yClass;
            const paddingY = this.config.scaleConfig.logY
                ? 0
                : this.config.domainConfig.paddingY;
            this.domain.y = this.domainManager.getDomain(
                (d) => d[yClass],
                paddingY
            );
        } else {
            this.domain.y = this.config.domainConfig.defaultDomainY;
        }

        this.onSetupDomain();
    }

    setupScales(): void {
        this.scaleManager = new ScaleManager(this.config.colorConfig);

        this.scale.x = this.scaleManager.getScale(
            this.domain.x,
            [0, this.plotWidth],
            this.config.scaleConfig.logX,
            this.config.scaleConfig.formatNiceX
        );

        this.scale.y = this.scaleManager.getScale(
            this.domain.y,
            [this.plotHeight, 0],
            this.config.scaleConfig.logY,
            this.config.scaleConfig.formatNiceY
        );

        this.scale.color = this.scaleManager.getColorScale();

        this.onSetupScales();
    }

    setupAxes(): void {
        if (!this.config.axisConfig.showAxis) return;

        this.axes = new AxisManager(
            this.plotArea,
            this.plotWidth,
            this.plotHeight,
            this.config.axisConfig
        );

        this.axes.setXAxis(this.scale.x as d3.AxisScale<string>);
        this.axes.setYAxis(this.scale.y as d3.AxisScale<string>);

        if (this.config.axisConfig.showGrid) {
            this.axes.setXGrid();
            this.axes.setYGrid();
        }

        const xLabel = this.config.axisConfig.xLabel === null
        ? this.props.xClass
        : this.config.axisConfig.xLabel;

        if (xLabel) {
            this.axes.setXLabel(
                xLabel,
                this.config.margin.bottom,
                this.config.themeConfig.fontSize
            );
        }

        const yLabel = this.config.axisConfig.yLabel === null
        ? this.props.yClass
        : this.config.axisConfig.yLabel

        if (yLabel) {
            this.axes.setYLabel(
                yLabel,
                this.config.margin.left,
                this.config.themeConfig.fontSize
            );
        }

        this.addUpdateFunction(() => {
            if (this.config.axisConfig.showGrid) {
                this.axes.removeXGrid();
                this.axes.removeYGrid();
            }
            this.axes.updateXAxis(
                this.scale.x as d3.AxisScale<string>,
                this.config.themeConfig.transitionDuration
            );
            this.axes.updateYAxis(
                this.scale.y as d3.AxisScale<string>,
                this.config.themeConfig.transitionDuration
            );
            if (this.config.axisConfig.showGrid) {
                this.axes.setXGrid();
                this.axes.setYGrid();
            }
        });
    }

    setupLegend(): void {
        if (!this.config.legendConfig.legendRef.current) return;
        this.legend = new LegendManager({
            ...this.config.legendConfig,
            maxHeight: this.config.legendConfig.maxHeight ?? this.plotHeight,
        });
        this.onSetupLegend();
    }

    setupTooltip(): void {
        if (!this.config.tooltipConfig.tooltipRef.current) return;
        this.tooltipManager = new TooltipManager(this.config.tooltipConfig, this.ref);
        this.tooltipManager.hideTooltip();
        this.onSetupTooltip();
    }

    setupBrush(): void {
        if (!this.config.themeConfig.enableZoom) return;

        this.brush = new BrushManager(
            this.plot,
            [
                [0, 0],
                [this.plotWidth, this.plotHeight],
            ],
            this.zoomToSelection.bind(this),
            this.resetZoom.bind(this),
            this.config.themeConfig.transitionDuration
        );

        this.onSetupBrush();
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
        if (this.brush) {
            this.interactionSurface = this.plot
                .select('.brush')
                .select('.overlay');
        } else {
            this.interactionSurface = this.plot
                .append('rect')
                .attr('class', 'interaction-surface')
                .attr('fill', 'none')
                .attr('width', this.plotWidth)
                .attr('height', this.plotHeight)
                .style('pointer-events', 'all');
        }
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

    getEventCoords(
        event: Event,
        coordinateSystem = CoordinateSystem.Pixel
    ): [number, number] {
        const [x, y] = d3.pointer(event, this.plot.node());
        if (coordinateSystem === CoordinateSystem.Data) {
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

    handleDrawError(error: unknown): void {
        console.error(`${this.constructor.name} chart drawing failed:`, error);
    }

    drawTooltip(): void {
        console.warn(
            'drawTooltip() is not implemented! Override this method in your chart subclass.'
        );
    }

    renderElements(): void {
        console.warn(
            'renderElements() is not implemented! Override this method in your chart subclass.'
        );
    }

    // Main drawing method
    drawChart(): void {
        try {
            this.initializePhase();
            this.setupPhase();
            this.renderPhase();
        } catch (error) {
            this.handleDrawError(error);
            ``;
            this.cleanup();
        }
    }

    initializePhase(): void {
        this.initializePlot();
        this.initializePrimitives();
    }

    setupPhase(): void {
        this.setupDomain();
        this.setupScales();
        this.setupAxes();
        this.setupBrush();
        this.setupInteractionSurface();
    }

    renderPhase(): void {
        this.setupLegend();
        this.setupTooltip();
        this.renderElements();
        this.onRenderComplete();
    }

    // Lifecycle hooks - to be optionally overridden by subclasses
    onInitializeProperties(): void {}
    onInitializePlot(): void {}
    onInitializePrimitives(): void {}
    onSetupDomain(): void {}
    onSetupScales(): void {}
    onSetupAxes(): void {}
    onSetupBrush(): void {}
    onSetupLegend(): void {}
    onSetupTooltip(): void {}
    onRenderComplete(): void {}
    onUpdateChart(): void {}
    onCleanup(): void {}

    render() {
        return <div ref={this.ref} style={{ width: '100%' }}></div>;
    }
}

export default BasePlot;
