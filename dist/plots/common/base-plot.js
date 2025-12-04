import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Component } from 'react';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';
import { CLOVE_CLASSES } from './config/classes';
import PrimitiveManager from './primitives/primitive-manager';
import TooltipManager from './tooltip-manager';
import LegendManager from './legend-manager';
import DomainManager from './domain-manager';
import ScaleManager, { isContinuousScale, } from './scale-manager';
import AxisManager from './axis-manager';
import BrushManager from './brush-manager';
import { measureMaxTextWidth, getChartFontStyles, } from './utils';
import { isStringArray } from './utils/type-guards';
import { DEFAULT_PLOT_MARGIN, DEFAULT_PLOT_DIMENSIONS, DEFAULT_THEME_CONFIG, DEFAULT_DOMAIN_CONFIG, DEFAULT_SCALE_CONFIG, DEFAULT_AXIS_CONFIG, DEFAULT_LEGEND_CONFIG, DEFAULT_TOOLTIP_CONFIG, DEFAULT_COLOR_CONFIG, MARGIN_PRESETS, } from './config';
export function getPlotConfig(config) {
    return {
        margin: { ...DEFAULT_PLOT_MARGIN, ...config === null || config === void 0 ? void 0 : config.margin },
        dimensions: { ...DEFAULT_PLOT_DIMENSIONS, ...config === null || config === void 0 ? void 0 : config.dimensions },
        themeConfig: { ...DEFAULT_THEME_CONFIG, ...config === null || config === void 0 ? void 0 : config.themeConfig },
        domainConfig: { ...DEFAULT_DOMAIN_CONFIG, ...config === null || config === void 0 ? void 0 : config.domainConfig },
        scaleConfig: { ...DEFAULT_SCALE_CONFIG, ...config === null || config === void 0 ? void 0 : config.scaleConfig },
        axisConfig: { ...DEFAULT_AXIS_CONFIG, ...config === null || config === void 0 ? void 0 : config.axisConfig },
        legendConfig: { ...DEFAULT_LEGEND_CONFIG, ...config === null || config === void 0 ? void 0 : config.legendConfig },
        tooltipConfig: { ...DEFAULT_TOOLTIP_CONFIG, ...config === null || config === void 0 ? void 0 : config.tooltipConfig },
        colorConfig: { ...DEFAULT_COLOR_CONFIG, ...config === null || config === void 0 ? void 0 : config.colorConfig },
    };
}
/**
 * Checks if user explicitly passed margin values (excluding the `auto` property)
 */
function hasUserDefinedMargins(margin) {
    if (!margin)
        return false;
    return (margin.top !== undefined ||
        margin.bottom !== undefined ||
        margin.left !== undefined ||
        margin.right !== undefined);
}
class BasePlot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
        };
        this.config = getPlotConfig(props);
        this.wrapperRef = React.createRef();
        this.ref = React.createRef();
        this.legendRef = React.createRef();
        this.tooltipRef = React.createRef();
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
        if (!this.havePropsChanged(prevProps)) {
            return;
        }
        this.config = getPlotConfig(this.props);
        if (this.shouldInitializeChart()) {
            this.initializeChart();
        }
        else {
            this.cleanup();
        }
    }
    havePropsChanged(prevProps) {
        const keys = new Set([
            ...Object.keys(this.props),
            ...Object.keys(prevProps),
        ]);
        for (const key of keys) {
            if (this.props[key] !== prevProps[key]) {
                return true;
            }
        }
        return false;
    }
    shouldInitializeChart() {
        return true;
    }
    initializeChart() {
        this.cleanup();
        this.initializeProperties();
        this.drawChart();
    }
    initializeProperties() {
        var _a, _b;
        if (!this.ref.current)
            return;
        const rect = this.ref.current.getBoundingClientRect();
        this.width = (_a = this.config.dimensions.width) !== null && _a !== void 0 ? _a : rect.width;
        this.height =
            (_b = this.config.dimensions.height) !== null && _b !== void 0 ? _b : this.width * this.config.dimensions.heightToWidthRatio;
        this.domainManager = new DomainManager(this.config.domainConfig, this.config.scaleConfig);
        this.scaleManager = new ScaleManager(this.config.scaleConfig, this.config.colorConfig);
        this.onInitializeProperties();
        // Apply auto-margins if enabled and user hasn't passed explicit margins
        if (this.config.margin.auto &&
            !hasUserDefinedMargins(this.props.margin)) {
            this.applyAutoMargins();
        }
    }
    applyAutoMargins() {
        const domainX = this.getDefaultDomainX();
        const domainY = this.getDefaultDomainY();
        const calculatedMargins = this.calculateAutoMargins(domainX, domainY);
        this.config.margin = {
            ...this.config.margin,
            ...calculatedMargins,
        };
    }
    calculateAutoMargins(domainX, domainY) {
        const { axisConfig, legendConfig } = this.config;
        const hasXLabel = axisConfig.xLabel !== '' &&
            (axisConfig.xLabel !== null || this.props.xKey !== undefined);
        const hasYLabel = axisConfig.yLabel !== '' &&
            (axisConfig.yLabel !== null || this.props.yKey !== undefined);
        const hasLegend = legendConfig.enabled;
        const hasStringDomainX = isStringArray(domainX);
        const hasStringDomainY = isStringArray(domainY);
        const { fontSize } = getChartFontStyles();
        const xLabelHeight = fontSize + 10;
        const yLabelHeight = fontSize;
        let leftMargin;
        if (hasStringDomainY) {
            const yTickLabels = domainY;
            const maxYTickWidth = measureMaxTextWidth(yTickLabels);
            leftMargin = maxYTickWidth + axisConfig.tickSize;
            if (hasYLabel) {
                leftMargin += yLabelHeight + axisConfig.labelOffsetY;
            }
        }
        else {
            leftMargin = hasYLabel
                ? MARGIN_PRESETS.left
                : MARGIN_PRESETS.leftNoLabel;
        }
        let bottomMargin;
        if (hasStringDomainX) {
            bottomMargin = fontSize + axisConfig.tickSize;
            if (hasXLabel) {
                bottomMargin += xLabelHeight + axisConfig.labelOffsetX;
            }
        }
        else {
            bottomMargin = hasXLabel
                ? MARGIN_PRESETS.bottom
                : MARGIN_PRESETS.bottomNoLabel;
        }
        let rightMargin;
        if (hasLegend) {
            rightMargin = MARGIN_PRESETS.rightWithLegend;
        }
        else if (hasStringDomainX) {
            const xTickLabels = domainX;
            const maxXTickWidth = measureMaxTextWidth(xTickLabels);
            rightMargin = Math.max(maxXTickWidth / 2, MARGIN_PRESETS.right);
        }
        else {
            rightMargin = MARGIN_PRESETS.right;
        }
        return {
            top: Math.ceil(MARGIN_PRESETS.top),
            bottom: Math.ceil(bottomMargin),
            left: Math.ceil(leftMargin),
            right: Math.ceil(rightMargin),
        };
    }
    initializePlot() {
        d3.select(this.ref.current).selectAll('*').remove();
        if (this.legendRef.current) {
            d3.select(this.legendRef.current).selectAll('*').remove();
        }
        this.plotWidth = Math.max(0, this.width - this.config.margin.left - this.config.margin.right);
        this.plotHeight = Math.max(0, this.height - this.config.margin.top - this.config.margin.bottom);
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
            .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);
        this.plotArea
            .append('rect')
            .attr('width', this.plotWidth)
            .attr('height', this.plotHeight)
            .attr('fill', 'none') // so that the background is transparent
            .attr('class', CLOVE_CLASSES.plotBackground);
        this.plot = this.plotArea
            .append('g')
            .attr('class', CLOVE_CLASSES.plot)
            .attr('clip-path', `url(#${this.clipPathId})`);
        this.onInitializePlot();
    }
    setupPrimitives() {
        this.primitiveManager = new PrimitiveManager(this);
    }
    getDefaultDomainX() {
        var _a;
        const data = ((_a = this.props.data) !== null && _a !== void 0 ? _a : []);
        const xValues = this.props.xKey
            ? data.map((d) => d[this.props.xKey])
            : [];
        return this.domainManager.getDomainX(xValues);
    }
    getDefaultDomainY() {
        var _a;
        const data = ((_a = this.props.data) !== null && _a !== void 0 ? _a : []);
        const yValues = this.props.yKey
            ? data.map((d) => d[this.props.yKey])
            : [];
        return this.domainManager.getDomainY(yValues);
    }
    getDefaultDomain() {
        return {
            x: this.getDefaultDomainX(),
            y: this.getDefaultDomainY(),
        };
    }
    getDefaultScaleX() {
        return this.scaleManager.getScaleX(this.domain.x, this.plotWidth);
    }
    getDefaultScaleY() {
        return this.scaleManager.getScaleY(this.domain.y, this.plotHeight);
    }
    getDefaultScales() {
        return {
            x: this.getDefaultScaleX(),
            y: this.getDefaultScaleY(),
        };
    }
    configureDomainAndScales() {
        this.domain = this.getDefaultDomain();
        this.scale = this.getDefaultScales();
    }
    setupAxes() {
        const showAnyAxis = this.config.axisConfig.showAxisX || this.config.axisConfig.showAxisY;
        if (!showAnyAxis)
            return;
        this.axisManager = new AxisManager(this.plotArea, this.plotWidth, this.plotHeight, this.config.axisConfig);
        if (this.config.axisConfig.showAxisX) {
            this.axisManager.setXAxis(this.scale.x);
        }
        if (this.config.axisConfig.showAxisY) {
            this.axisManager.setYAxis(this.scale.y);
        }
        if (this.config.axisConfig.showGridX && this.config.axisConfig.showAxisX) {
            this.axisManager.setXGrid();
        }
        if (this.config.axisConfig.showGridY && this.config.axisConfig.showAxisY) {
            this.axisManager.setYGrid();
        }
        const xLabel = this.config.axisConfig.xLabel === null
            ? this.props.xKey
            : this.config.axisConfig.xLabel;
        if (xLabel && this.config.axisConfig.showAxisX) {
            this.axisManager.setXLabel(xLabel, this.config.margin.bottom);
        }
        const yLabel = this.config.axisConfig.yLabel === null
            ? this.props.yKey
            : this.config.axisConfig.yLabel;
        if (yLabel && this.config.axisConfig.showAxisY) {
            this.axisManager.setYLabel(yLabel, this.config.margin.left);
        }
        this.addUpdateFunction(() => {
            if (this.config.axisConfig.showGridX && this.config.axisConfig.showAxisX) {
                this.axisManager.removeXGrid();
            }
            if (this.config.axisConfig.showGridY && this.config.axisConfig.showAxisY) {
                this.axisManager.removeYGrid();
            }
            if (this.config.axisConfig.showAxisX) {
                this.axisManager.updateXAxis(this.scale.x, this.config.themeConfig.transitionDuration);
            }
            if (this.config.axisConfig.showAxisY) {
                this.axisManager.updateYAxis(this.scale.y, this.config.themeConfig.transitionDuration);
            }
            if (this.config.axisConfig.showGridX && this.config.axisConfig.showAxisX) {
                this.axisManager.setXGrid();
            }
            if (this.config.axisConfig.showGridY && this.config.axisConfig.showAxisY) {
                this.axisManager.setYGrid();
            }
        });
    }
    setupBrush() {
        if (!this.config.themeConfig.enableZoom)
            return;
        this.brushManager = new BrushManager(this.plot, [
            [0, 0],
            [this.plotWidth, this.plotHeight],
        ], this.zoomToSelection.bind(this), this.resetZoom.bind(this), this.config.themeConfig.transitionDuration);
    }
    resetZoom() {
        this.scaleManager.setScaleDomain(this.scale.x, this.domain.x, this.config.scaleConfig.formatNiceX);
        this.scaleManager.setScaleDomain(this.scale.y, this.domain.y, this.config.scaleConfig.formatNiceY);
        this.updateChart();
    }
    zoomToSelection(extent) {
        if (!isContinuousScale(this.scale.x) ||
            !isContinuousScale(this.scale.y)) {
            console.warn('Zooming requires continuous scales');
            return;
        }
        // Check if the selection area is greater than the threshold pixels
        const threshold = this.config.themeConfig.zoomAreaThreshold;
        const shouldZoom = Math.abs(extent[1][0] - extent[0][0]) *
            Math.abs(extent[1][1] - extent[0][1]) >
            threshold;
        if (!shouldZoom)
            return;
        const newXDomain = [
            this.scale.x.invert(extent[0][0]),
            this.scale.x.invert(extent[1][0]),
        ];
        const newYDomain = [
            this.scale.y.invert(extent[1][1]),
            this.scale.y.invert(extent[0][1]),
        ];
        this.scaleManager.setScaleDomain(this.scale.x, newXDomain, false);
        this.scaleManager.setScaleDomain(this.scale.y, newYDomain, false);
        this.updateChart();
    }
    setupInteractionSurface() {
        if (this.brushManager) {
            this.interactionSurface = this.plot
                .select('.brush')
                .select('.overlay');
        }
        else {
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
    setupLegend() {
        var _a;
        const { enabled } = this.config.legendConfig;
        if (!enabled || !this.legendRef.current)
            return;
        // Clear previous content
        d3.select(this.legendRef.current).selectAll('*').remove();
        this.legendManager = new LegendManager({
            ...this.config.legendConfig,
            maxHeight: (_a = this.config.legendConfig.maxHeight) !== null && _a !== void 0 ? _a : this.plotHeight,
        }, this.legendRef.current);
        this.drawLegend();
    }
    setupTooltip() {
        const { enabled } = this.config.tooltipConfig;
        if (!enabled || !this.tooltipRef.current)
            return;
        this.tooltipManager = new TooltipManager(this.config.tooltipConfig, this.tooltipRef.current, this.wrapperRef);
        this.tooltipManager.hide();
        this.drawTooltip();
    }
    setupResizeObserver() {
        const element = this.ref.current;
        if (!element) {
            console.warn('Ref not available for resize handling');
            return;
        }
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                const { width } = entries[0].contentRect;
                this.updateDimensions(width);
            });
            this.resizeObserver.observe(element);
        }
        else {
            window.addEventListener('resize', this.handleResize);
            this.handleResize();
        }
    }
    handleResize() {
        if (!this.ref.current)
            return;
        const { width } = this.ref.current.getBoundingClientRect();
        this.updateDimensions(width);
    }
    updateDimensions(containerWidth) {
        var _a, _b;
        if (!this.config.dimensions)
            return; // Chart not yet initialized
        const newWidth = (_a = this.config.dimensions.width) !== null && _a !== void 0 ? _a : containerWidth;
        const newHeight = (_b = this.config.dimensions.height) !== null && _b !== void 0 ? _b : newWidth * this.config.dimensions.heightToWidthRatio;
        if (Math.round(newWidth) === Math.round(this.width) &&
            Math.round(newHeight) === Math.round(this.height)) {
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
            if (!isContinuousScale(this.scale.x) ||
                !isContinuousScale(this.scale.y)) {
                console.warn('Categorical scales do not support detecting event coordinates in the data coordinate system');
                return [x, y];
            }
            return [this.scale.x.invert(x), this.scale.y.invert(y)];
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
        if (this.tooltipManager) {
            this.tooltipManager.hide();
        }
        d3.select(this.ref.current).selectAll('*').remove();
        if (this.legendRef.current) {
            d3.select(this.legendRef.current).selectAll('*').remove();
        }
        this.updateFunctions = [];
        this.onCleanup();
    }
    // Main drawing method
    drawChart() {
        try {
            this.initializePlot();
            this.setupPrimitives();
            this.configureDomainAndScales();
            this.setupAxes();
            this.setupBrush();
            this.setupInteractionSurface();
            this.draw();
            this.setupLegend();
            this.setupTooltip();
            if (!this.state.isVisible) {
                this.setState({ isVisible: true });
            }
        }
        catch (error) {
            this.handleDrawError(error);
            this.cleanup();
        }
    }
    // Lifecycle hooks - to be optionally overridden by subclasses
    onInitializeProperties() { }
    onInitializePlot() { }
    drawTooltip() { }
    drawLegend() { }
    onUpdateChart() { }
    onCleanup() { }
    handleDrawError(error) { }
    render() {
        const legendEnabled = this.config.legendConfig.enabled;
        const tooltipEnabled = this.config.tooltipConfig.enabled;
        return (_jsxs("div", { ref: this.wrapperRef, className: CLOVE_CLASSES.chartWrapper, style: { opacity: this.state.isVisible ? 1 : 0 }, children: [tooltipEnabled && (_jsx("div", { ref: this.tooltipRef, className: CLOVE_CLASSES.tooltip })), _jsx("div", { ref: this.ref, style: { width: '100%' } }), legendEnabled && (_jsx("div", { ref: this.legendRef, className: CLOVE_CLASSES.legend }))] }));
    }
}
export default BasePlot;
