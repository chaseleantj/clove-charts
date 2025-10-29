import React, { Component } from 'react';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';

import PrimitiveManager from './primitive-manager';
import TooltipManager from './tooltip-manager';
import LegendManager from './legend-manager';
import DomainManager from './domain-manager';
import ScaleManager from './scale-manager';
import AxisManager from './axis-manager';
import BrushManager from './brush-manager';
import { validateProps } from './utils';

import {
    DEFAULT_PLOT_MARGIN,
    DEFAULT_PLOT_DIMENSIONS,
    DEFAULT_THEME_CONFIG,
    DEFAULT_DOMAIN_CONFIG,
    DEFAULT_SCALE_CONFIG,
    DEFAULT_AXIS_CONFIG,
    DEFAULT_LEGEND_CONFIG,
    DEFAULT_TOOLTIP_CONFIG,
    DEFAULT_COLOR_CONFIG,
} from './config';

/**
 * Base class for Base plots
 *
 * Props:
 * @param {Array} data - The data to be plotted
 * @param {String} xClass - Data field for x-axis values
 * @param {String} yClass - Data field for y-axis values
 * @param {Array} domainX - [min, max] for the x-domain
 * @param {Array} domainY - [min, max] for the y-domain
 */
class BasePlot extends Component {
    // Required props for the base class - subclasses can override this
    static requiredProps = [];

    static defaultProps = {
        margin: {},
        dimensions: {},
        themeConfig: {},
        domainConfig: {},
        scaleConfig: {},
        axisConfig: {},
        legendConfig: {},
        tooltipConfig: {},
        colorConfig: {},
    };

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.clipPathId = 'clip-' + uuidv4();
        this.updateFunctions = [];
        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        this.setupResizeObserver();
        if (!this.shouldInitializeChart()) {
            return;
        }
        this.initializeChart();
    }

    componentWillUnmount() {
        this.cleanup();

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        const shouldRedraw = Object.keys(this.props).some(
            (prop) => this.props[prop] !== prevProps[prop]
        );
        if (shouldRedraw) {
            if (this.shouldInitializeChart()) {
                this.initializeChart();
            } else {
                this.cleanup(); // If there are some problems with the passed props, then do not redraw and erase the whole chart instead.
            }
        }
    }

    shouldInitializeChart() {
        return validateProps(
            this.props,
            this.constructor.requiredProps,
            this.constructor.name
        );
    }

    initializeChart() {
        this.initializeProperties();
        this.drawChart();
    }

    initializeProperties() {
        // Copy props to instance variables for easier access
        Object.assign(this, this.props);

        this.margin = {
            ...DEFAULT_PLOT_MARGIN,
            ...this.margin,
        };

        this.dimensions = {
            ...DEFAULT_PLOT_DIMENSIONS,
            ...this.dimensions,
        };

        this.themeConfig = {
            ...DEFAULT_THEME_CONFIG,
            ...this.themeConfig,
        };

        this.axisConfig = {
            ...DEFAULT_AXIS_CONFIG,
            ...this.axisConfig,
        };

        this.domainConfig = {
            ...DEFAULT_DOMAIN_CONFIG,
            ...this.domainConfig,
        };

        this.scaleConfig = {
            ...DEFAULT_SCALE_CONFIG,
            ...this.scaleConfig,
        };

        this.legendConfig = {
            ...DEFAULT_LEGEND_CONFIG,
            ...this.legendConfig,
        };

        this.tooltipConfig = {
            ...DEFAULT_TOOLTIP_CONFIG,
            ...this.tooltipConfig,
        };

        this.colorConfig = {
            ...DEFAULT_COLOR_CONFIG,
            ...this.colorConfig,
        };

        const rect = this.ref.current.getBoundingClientRect();
        this.width = this.dimensions.width ?? rect.width;
        this.height =
            this.dimensions.height ??
            this.width * this.dimensions.heightToWidthRatio;

        this.onInitializeProperties();
    }

    initializePrimitives() {
        this.primitives = new PrimitiveManager(this);
        this.onInitializePrimitives();
    }

    initializePlot() {
        d3.select(this.ref.current).selectAll('*').remove();
        d3.select(this.legendConfig.legendRef.current).selectAll('*').remove();

        this.plotWidth = Math.max(
            0,
            this.width - this.margin.left - this.margin.right
        );
        this.plotHeight = Math.max(
            0,
            this.height - this.margin.top - this.margin.bottom
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
                `translate(${this.margin.left},${this.margin.top})`
            )
            .attr('class', 'plot-area');

        this.plot = this.plotArea
            .append('g')
            .attr('class', 'plot')
            .attr('clip-path', `url(#${this.clipPathId})`);

        this.onInitializePlot();
    }

    setupDomain() {
        this.domain = new DomainManager(this.data);

        // x domain configuration
        if (this.domainX) {
            this.domain.x = this.domainX;
        } else if (this.xClass) {
            const paddingX = this.scaleConfig.logX
                ? 0
                : this.domainConfig.paddingX;
            this.domain.x = this.domain.getDomain(
                (d) => d[this.xClass],
                paddingX
            );
        } else {
            this.domain.x = this.domainConfig.defaultDomainX;
        }

        // y domain configuration
        if (this.domainY) {
            this.domain.y = this.domainY;
        } else if (this.yClass) {
            const paddingY = this.scaleConfig.logY
                ? 0
                : this.domainConfig.paddingY;
            this.domain.y = this.domain.getDomain(
                (d) => d[this.yClass],
                paddingY
            );
        } else {
            this.domain.y = this.domainConfig.defaultDomainY;
        }

        this.onSetupDomain();
    }

    setupScales() {
        this.scales = new ScaleManager(this.colorConfig);

        this.scales.x = this.scales.getScale(
            this.domain.x,
            [0, this.plotWidth],
            this.scaleConfig.logX,
            this.scaleConfig.formatNiceX
        );

        this.scales.y = this.scales.getScale(
            this.domain.y,
            [this.plotHeight, 0],
            this.scaleConfig.logY,
            this.scaleConfig.formatNiceY
        );

        this.scales.pixelToPercentWidth = this.scales.getScale(
            [0, this.plotWidth],
            [0, 1]
        );

        this.scales.pixelToPercentHeight = this.scales.getScale(
            [0, this.plotHeight],
            [0, 1]
        );

        this.scales.color = this.scales.getColorScale();

        this.onSetupScales();
    }

    setupAxes() {
        if (!this.axisConfig.showAxis) return;

        this.axes = new AxisManager(
            this.plotArea,
            this.plotWidth,
            this.plotHeight,
            this.axisConfig
        );

        this.axes.setXAxis(this.scales.x);
        this.axes.setYAxis(this.scales.y);

        if (this.axisConfig.showGrid) {
            this.axes.setXGrid();
            this.axes.setYGrid();
        }

        this.axes.setXLabel(
            this.axisConfig.xLabel === null
                ? this.xClass
                : this.axisConfig.xLabel,
            this.margin.bottom,
            this.themeConfig.fontSize
        );

        this.axes.setYLabel(
            this.axisConfig.yLabel === null
                ? this.yClass
                : this.axisConfig.yLabel,
            this.margin.left,
            this.themeConfig.fontSize
        );

        this.addUpdateFunction(() => {
            if (this.axisConfig.showGrid) {
                this.axes.removeXGrid();
                this.axes.removeYGrid();
            }
            this.axes.updateXAxis(
                this.scales.x,
                this.themeConfig.transitionDuration
            );
            this.axes.updateYAxis(
                this.scales.y,
                this.themeConfig.transitionDuration
            );
            if (this.axisConfig.showGrid) {
                this.axes.setXGrid();
                this.axes.setYGrid();
            }
        });
    }

    setupLegend() {
        if (!this.legendConfig.legendRef.current) return;
        this.legend = new LegendManager({
            ...this.legendConfig,
            maxHeight: this.legendConfig.maxHeight ?? this.plotHeight,
        });
        this.onSetupLegend();
    }

    setupTooltip() {
        if (!this.tooltipConfig.tooltipRef.current) return;
        this.tooltip = new TooltipManager(this.tooltipConfig, this.ref);
        this.tooltip.hide();
        this.onSetupTooltip();
    }

    setupBrush() {
        if (!this.themeConfig.enableZoom) return;

        this.brush = new BrushManager(
            this.plot,
            [
                [0, 0],
                [this.plotWidth, this.plotHeight],
            ],
            this.zoomToSelection.bind(this),
            this.resetZoom.bind(this),
            this.themeConfig.transitionDuration
        );

        this.onSetupBrush();
    }

    resetZoom() {
        this.scales.setScaleDomain(
            this.scales.x,
            this.domain.x,
            this.scaleConfig.formatNiceX
        );
        this.scales.setScaleDomain(
            this.scales.y,
            this.domain.y,
            this.scaleConfig.formatNiceY
        );
        this.updateChart();
    }

    zoomToSelection(extent) {
        // Check if the selection area is greater than the threshold pixels
        const threshold = this.themeConfig.zoomAreaThreshold;
        const shouldZoom =
            Math.abs(extent[1][0] - extent[0][0]) *
                Math.abs(extent[1][1] - extent[0][1]) >
            threshold;

        if (!shouldZoom) return;

        const newXDomain = [
            this.scales.x.invert(extent[0][0]),
            this.scales.x.invert(extent[1][0]),
        ];

        const newYDomain = [
            this.scales.y.invert(extent[1][1]),
            this.scales.y.invert(extent[0][1]),
        ];

        this.scales.setScaleDomain(this.scales.x, newXDomain, false);
        this.scales.setScaleDomain(this.scales.y, newYDomain, false);

        this.updateChart();
    }

    setupInteractionSurface() {
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

    setupResizeObserver() {
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0].contentRect;
                this.updateDimensions(width, height);
            });
            this.resizeObserver.observe(this.ref.current);
        } else {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        }
    }

    handleResize() {
        if (!this.ref.current) return;
        const { width, height } = this.ref.current.getBoundingClientRect();
        this.updateDimensions(width);
    }

    updateDimensions(containerWidth) {
        if (!this.dimensions) return; // Chart not yet initialized

        const newWidth = this.dimensions.width ?? containerWidth;
        const newHeight =
            this.dimensions.height ??
            newWidth * this.dimensions.heightToWidthRatio;

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

    getEventCoords(event, coordinateSystem = 'pixel') {
        const [x, y] = d3.pointer(event, this.plot.node());
        if (coordinateSystem === 'data') {
            return [this.scales.x.invert(x), this.scales.y.invert(y)];
        }
        return [x, y];
    }

    addUpdateFunction(updateFunction) {
        this.updateFunctions.push(updateFunction);
    }

    updateChart() {
        for (let updateFunction of this.updateFunctions) {
            updateFunction.call(this);
        }
        this.onUpdateChart();
    }

    cleanup() {
        if (this.svg) {
            this.svg.selectAll('*').interrupt();
        }
        if (this.tooltip) {
            this.tooltip.hide();
        }

        d3.select(this.ref.current).selectAll('*').remove();

        if (this.legendConfig?.legendRef?.current) {
            d3.select(this.legendConfig.legendRef.current)
                .selectAll('*')
                .remove();
        }

        this.updateFunctions = [];
        this.onCleanup();
    }

    handleDrawError(error) {
        console.error(`${this.constructor.name} chart drawing failed:`, error);
    }

    drawTooltip() {
        console.warn(
            'drawTooltip() is not implemented! Override this method in your chart subclass.'
        );
    }

    renderElements() {
        console.warn(
            'renderElements() is not implemented! Override this method in your chart subclass.'
        );
    }

    // Main drawing method
    drawChart() {
        try {
            this.initializePhase();
            this.setupPhase();
            this.renderPhase();
        } catch (error) {
            this.handleDrawError(error);
            this.cleanup();
        }
    }

    initializePhase() {
        this.initializePlot();
        this.initializePrimitives();
    }

    setupPhase() {
        this.setupDomain();
        this.setupScales();
        this.setupAxes();
        this.setupBrush();
        this.setupInteractionSurface();
    }

    renderPhase() {
        this.setupLegend();
        this.setupTooltip();
        this.renderElements();
        this.onRenderComplete();
    }

    // Lifecycle hooks - to be optionally overridden by subclasses
    onInitializeProperties() {}
    onInitializePlot() {}
    onInitializePrimitives() {}
    onSetupDomain() {}
    onSetupScales() {}
    onSetupAxes() {}
    onSetupBrush() {}
    onSetupLegend() {}
    onSetupTooltip() {}
    onRenderComplete() {}
    onUpdateChart() {}
    onCleanup() {}

    render() {
        return <div ref={this.ref} style={{ width: '100%' }}></div>;
    }
}

export default BasePlot;
