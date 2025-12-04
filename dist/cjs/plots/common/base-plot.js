"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlotConfig = getPlotConfig;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const d3 = __importStar(require("d3"));
const uuid_1 = require("uuid");
const classes_1 = require("./config/classes");
const primitive_manager_1 = __importDefault(require("./primitives/primitive-manager"));
const tooltip_manager_1 = __importDefault(require("./tooltip-manager"));
const legend_manager_1 = __importDefault(require("./legend-manager"));
const domain_manager_1 = __importDefault(require("./domain-manager"));
const scale_manager_1 = __importStar(require("./scale-manager"));
const axis_manager_1 = __importDefault(require("./axis-manager"));
const brush_manager_1 = __importDefault(require("./brush-manager"));
const utils_1 = require("./utils");
const type_guards_1 = require("./utils/type-guards");
const config_1 = require("./config");
function getPlotConfig(config) {
    return {
        margin: { ...config_1.DEFAULT_PLOT_MARGIN, ...config === null || config === void 0 ? void 0 : config.margin },
        dimensions: { ...config_1.DEFAULT_PLOT_DIMENSIONS, ...config === null || config === void 0 ? void 0 : config.dimensions },
        themeConfig: { ...config_1.DEFAULT_THEME_CONFIG, ...config === null || config === void 0 ? void 0 : config.themeConfig },
        domainConfig: { ...config_1.DEFAULT_DOMAIN_CONFIG, ...config === null || config === void 0 ? void 0 : config.domainConfig },
        scaleConfig: { ...config_1.DEFAULT_SCALE_CONFIG, ...config === null || config === void 0 ? void 0 : config.scaleConfig },
        axisConfig: { ...config_1.DEFAULT_AXIS_CONFIG, ...config === null || config === void 0 ? void 0 : config.axisConfig },
        legendConfig: { ...config_1.DEFAULT_LEGEND_CONFIG, ...config === null || config === void 0 ? void 0 : config.legendConfig },
        tooltipConfig: { ...config_1.DEFAULT_TOOLTIP_CONFIG, ...config === null || config === void 0 ? void 0 : config.tooltipConfig },
        colorConfig: { ...config_1.DEFAULT_COLOR_CONFIG, ...config === null || config === void 0 ? void 0 : config.colorConfig },
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
class BasePlot extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
        };
        this.config = getPlotConfig(props);
        this.wrapperRef = react_1.default.createRef();
        this.ref = react_1.default.createRef();
        this.legendRef = react_1.default.createRef();
        this.tooltipRef = react_1.default.createRef();
        this.clipPathId = 'clip-' + (0, uuid_1.v4)();
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
        this.domainManager = new domain_manager_1.default(this.config.domainConfig, this.config.scaleConfig);
        this.scaleManager = new scale_manager_1.default(this.config.scaleConfig, this.config.colorConfig);
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
        const hasStringDomainX = (0, type_guards_1.isStringArray)(domainX);
        const hasStringDomainY = (0, type_guards_1.isStringArray)(domainY);
        const { fontSize } = (0, utils_1.getChartFontStyles)();
        const xLabelHeight = fontSize + 10;
        const yLabelHeight = fontSize;
        let leftMargin;
        if (hasStringDomainY) {
            const yTickLabels = domainY;
            const maxYTickWidth = (0, utils_1.measureMaxTextWidth)(yTickLabels);
            leftMargin = maxYTickWidth + axisConfig.tickSize;
            if (hasYLabel) {
                leftMargin += yLabelHeight + axisConfig.labelOffsetY;
            }
        }
        else {
            leftMargin = hasYLabel
                ? config_1.MARGIN_PRESETS.left
                : config_1.MARGIN_PRESETS.leftNoLabel;
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
                ? config_1.MARGIN_PRESETS.bottom
                : config_1.MARGIN_PRESETS.bottomNoLabel;
        }
        let rightMargin;
        if (hasLegend) {
            rightMargin = config_1.MARGIN_PRESETS.rightWithLegend;
        }
        else if (hasStringDomainX) {
            const xTickLabels = domainX;
            const maxXTickWidth = (0, utils_1.measureMaxTextWidth)(xTickLabels);
            rightMargin = Math.max(maxXTickWidth / 2, config_1.MARGIN_PRESETS.right);
        }
        else {
            rightMargin = config_1.MARGIN_PRESETS.right;
        }
        return {
            top: Math.ceil(config_1.MARGIN_PRESETS.top),
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
            .attr('class', classes_1.CLOVE_CLASSES.plotBackground);
        this.plot = this.plotArea
            .append('g')
            .attr('class', classes_1.CLOVE_CLASSES.plot)
            .attr('clip-path', `url(#${this.clipPathId})`);
        this.onInitializePlot();
    }
    setupPrimitives() {
        this.primitiveManager = new primitive_manager_1.default(this);
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
        this.axisManager = new axis_manager_1.default(this.plotArea, this.plotWidth, this.plotHeight, this.config.axisConfig);
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
        this.brushManager = new brush_manager_1.default(this.plot, [
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
        if (!(0, scale_manager_1.isContinuousScale)(this.scale.x) ||
            !(0, scale_manager_1.isContinuousScale)(this.scale.y)) {
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
        this.legendManager = new legend_manager_1.default({
            ...this.config.legendConfig,
            maxHeight: (_a = this.config.legendConfig.maxHeight) !== null && _a !== void 0 ? _a : this.plotHeight,
        }, this.legendRef.current);
        this.drawLegend();
    }
    setupTooltip() {
        const { enabled } = this.config.tooltipConfig;
        if (!enabled || !this.tooltipRef.current)
            return;
        this.tooltipManager = new tooltip_manager_1.default(this.config.tooltipConfig, this.tooltipRef.current, this.wrapperRef);
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
            if (!(0, scale_manager_1.isContinuousScale)(this.scale.x) ||
                !(0, scale_manager_1.isContinuousScale)(this.scale.y)) {
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
        return ((0, jsx_runtime_1.jsxs)("div", { ref: this.wrapperRef, className: classes_1.CLOVE_CLASSES.chartWrapper, style: { opacity: this.state.isVisible ? 1 : 0 }, children: [tooltipEnabled && ((0, jsx_runtime_1.jsx)("div", { ref: this.tooltipRef, className: classes_1.CLOVE_CLASSES.tooltip })), (0, jsx_runtime_1.jsx)("div", { ref: this.ref, style: { width: '100%' } }), legendEnabled && ((0, jsx_runtime_1.jsx)("div", { ref: this.legendRef, className: classes_1.CLOVE_CLASSES.legend }))] }));
    }
}
exports.default = BasePlot;
