import * as d3 from 'd3';
import { isContinuousScale } from '../scale-manager';
import { renderKatex } from '../utils';
export class Primitive {
    constructor(manager, element, options) {
        this.manager = manager;
        this.element = element;
        this.options = options;
        this.updateFunc = null;
        // Force elements to be static when using pixel coordinates
        if (this.options.coordinateSystem === 'pixel') {
            this.options.staticElement = true;
        }
    }
    setStyles(styles) {
        this.options = { ...this.options, ...styles };
        return this;
    }
    // Converts coordinates based on coordinate system
    convertX(x) {
        if (this.options.coordinateSystem === 'pixel') {
            return x;
        }
        const scale = this.manager.BasePlot.scale.x;
        return isContinuousScale(scale) ? scale(x) : x;
    }
    convertY(y) {
        if (this.options.coordinateSystem === 'pixel') {
            return y;
        }
        const scale = this.manager.BasePlot.scale.y;
        return isContinuousScale(scale) ? scale(y) : y;
    }
    getElementWithTransition(element, transitionDuration = 0, ease) {
        if (transitionDuration > 0) {
            let transitionElement = element
                .transition()
                .duration(transitionDuration);
            if (ease) {
                transitionElement = transitionElement.ease(ease);
            }
            return transitionElement;
        }
        return element;
    }
    applyCommonStyles(element) {
        return element
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('pointer-events', this.options.pointerEvents);
    }
    createUpdateFunction(updateCallback) {
        if (!this.options.staticElement) {
            this.updateFunc = updateCallback.bind(this.manager.BasePlot);
            this.manager.BasePlot.addUpdateFunction(this.updateFunc);
        }
        return this;
    }
    update() {
        if (this.updateFunc) {
            this.updateFunc();
        }
    }
    remove() {
        this.element.remove();
        if (this.updateFunc) {
            // Remove from update functions in BasePlot
            const index = this.manager.BasePlot.updateFunctions.indexOf(this.updateFunc);
            if (index > -1) {
                this.manager.BasePlot.updateFunctions.splice(index, 1);
            }
        }
    }
    show() {
        this.element.style('opacity', this.options.opacity);
        return this;
    }
    hide() {
        this.element.style('opacity', 0);
        return this;
    }
    attachEvent(event, handler) {
        // pointerEvents cannot be none for events to be triggered
        if (this.options.pointerEvents === 'none') {
            this.options.pointerEvents = 'auto';
            this.element.attr('pointer-events', 'auto');
        }
        this.element.on(event, handler);
        return this;
    }
}
export class PointPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
    }
    setCoords(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        const symbolGenerator = d3
            .symbol()
            .type(this.options.symbolType)
            .size(this.options.size);
        return this.applyCommonStyles(element)
            .attr('d', symbolGenerator)
            .attr('transform', `translate(${this.convertX(this.x)}, ${this.convertY(this.y)})`);
    }
}
export class LinePrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
    }
    setCoords(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }
    render(transitionDuration = 0, ease) {
        let markerStart = null;
        let markerEnd = null;
        if (this.options.arrow === 'start' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(this.options.stroke, 'start');
            markerStart = `url(#${markerId})`;
        }
        if (this.options.arrow === 'end' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(this.options.stroke, 'end');
            markerEnd = `url(#${markerId})`;
        }
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        return this.applyCommonStyles(element)
            .attr('x1', this.convertX(this.x1))
            .attr('y1', this.convertY(this.y1))
            .attr('x2', this.convertX(this.x2))
            .attr('y2', this.convertY(this.y2))
            .attr('marker-start', markerStart)
            .attr('marker-end', markerEnd)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset);
    }
}
export class RectanglePrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
    }
    setCoords(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        const scaledX1 = this.convertX(this.x1);
        const scaledY1 = this.convertY(this.y1);
        const scaledX2 = this.convertX(this.x2);
        const scaledY2 = this.convertY(this.y2);
        const rectX = Math.min(scaledX1, scaledX2);
        const rectY = Math.min(scaledY1, scaledY2);
        const rectWidth = Math.abs(scaledX2 - scaledX1);
        const rectHeight = Math.abs(scaledY2 - scaledY1);
        return this.applyCommonStyles(element)
            .attr('x', rectX)
            .attr('y', rectY)
            .attr('width', rectWidth)
            .attr('height', rectHeight);
    }
}
export class TextPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.text = '';
        this.angle = options.angle;
    }
    setText(text) {
        this.text = text;
        if (!this.options.latex) {
            this.element.text(text);
        }
        return this;
    }
    setAngle(angle) {
        this.angle = angle;
        return this;
    }
    setCoords(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    render(duration = 0, ease) {
        let element = this.getElementWithTransition(this.element, duration, ease);
        const x = this.convertX(this.x);
        const y = this.convertY(this.y);
        if (this.options.latex) {
            element = this.renderMath(element, x, y);
        }
        else {
            element = this.renderPlainText(element, x, y);
        }
        return element;
    }
    renderPlainText(element, x, y) {
        this.applyCommonStyles(element)
            .attr('x', x)
            .attr('y', y)
            .attr('font-size', this.options.fontSize)
            .attr('font-family', this.options.fontFamily)
            .attr('text-anchor', this.options.anchor)
            .attr('dominant-baseline', this.options.baseline)
            .text(this.text);
        if (this.angle) {
            element.attr('transform', `rotate(${this.angle}, ${x}, ${y})`);
        }
        return element;
    }
    renderMath(element, x, y) {
        return renderKatex(this.text, element, x, y, this.angle);
    }
}
export class PathPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.dataPoints = [];
    }
    setData(dataPoints) {
        this.dataPoints = dataPoints;
        return this;
    }
    setCoordinateAccessors(xAccessor, yAccessor) {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        const lineGenerator = d3
            .line()
            .x((d) => {
            const val = this.xAccessor(d);
            return val != null ? this.convertX(val) : 0;
        })
            .y((d) => {
            const val = this.yAccessor(d);
            return val != null ? this.convertY(val) : 0;
        })
            .defined((d) => {
            const x = this.xAccessor(d);
            const y = this.yAccessor(d);
            return x != null && y != null && !isNaN(x) && !isNaN(y);
        })
            .curve(this.options.curve);
        return this.applyCommonStyles(element)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('d', lineGenerator(this.dataPoints));
    }
}
export class AreaPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.dataPoints = [];
    }
    setData(dataPoints) {
        this.dataPoints = dataPoints;
        return this;
    }
    setCoordinateAccessors(xAccessor, y0Accessor, y1Accessor) {
        this.xAccessor = xAccessor;
        this.y0Accessor = y0Accessor;
        this.y1Accessor = y1Accessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        const areaGenerator = d3
            .area()
            .x((d) => {
            const val = this.xAccessor(d);
            return val != null ? this.convertX(val) : 0;
        })
            .y0((d) => {
            const val = this.y0Accessor(d);
            return val != null ? this.convertY(val) : 0;
        })
            .y1((d) => {
            const val = this.y1Accessor(d);
            return val != null ? this.convertY(val) : 0;
        })
            .defined((d) => {
            const x = this.xAccessor(d);
            const y0 = this.y0Accessor(d);
            const y1 = this.y1Accessor(d);
            return (x != null &&
                y0 != null &&
                y1 != null &&
                !isNaN(x) &&
                !isNaN(y0) &&
                !isNaN(y1));
        })
            .curve(this.options.curve);
        return this.applyCommonStyles(element).attr('d', areaGenerator(this.dataPoints));
    }
}
export class ContourPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        // this.elementSelection = d3.select(null);
        this.fValues = [];
        this.xRange = [];
        this.yRange = [];
    }
    calculateContours(fValues, xRange, yRange, thresholds) {
        const resolutionX = xRange.length;
        const resolutionY = yRange.length;
        return d3
            .contours()
            .size([resolutionX, resolutionY])
            .thresholds(thresholds)(fValues);
    }
    createPathGenerator(xRange, yRange) {
        const resolutionX = xRange.length;
        const resolutionY = yRange.length;
        const domainX = d3.extent(xRange);
        const domainY = d3.extent(yRange);
        const idxToDomainX = d3
            .scaleLinear()
            .domain([0, resolutionX - 1])
            .range(domainX);
        const idxToDomainY = d3
            .scaleLinear()
            .domain([0, resolutionY - 1])
            .range(domainY);
        const self = this;
        return d3.geoPath().projection(d3.geoTransform({
            point: function (x, y) {
                this.stream.point(self.convertX(idxToDomainX(x)), self.convertY(idxToDomainY(y)));
            },
        }));
    }
    setData(fValues, xRange, yRange) {
        this.fValues = fValues;
        this.xRange = xRange;
        this.yRange = yRange;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const contours = this.calculateContours(this.fValues, this.xRange, this.yRange, this.options.thresholds);
        const pathGenerator = this.createPathGenerator(this.xRange, this.yRange);
        const selection = this.element
            .selectAll(`path.${this.options.className}`)
            .data(contours, (d, i) => i);
        selection.exit().remove();
        const enter = selection.enter().append('path');
        const merged = enter.merge(selection);
        // this.elementSelection = merged;
        const finalSelection = this.getElementWithTransition(merged, transitionDuration, ease);
        return this.applyCommonStyles(finalSelection)
            .attr('fill', (d) => this.options.colorScale
            ? this.options.colorScale(d.value)
            : 'none')
            .attr('class', this.options.className)
            .attr('d', pathGenerator);
    }
}
export class ImagePrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.useCornerCoords = options.useCornerCoords;
        this.preserveAspectRatio = options.preserveAspectRatio;
        this.isLoaded = false;
        this.isLoading = false;
        this.width = options.width;
        this.coords = options.coords;
    }
    setSource(href) {
        this.href = href;
        return this;
    }
    setCoords(coords) {
        this.coords = coords;
        return this;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    loadImage(href) {
        if (this.isLoading || this.isLoaded) {
            return this.loadPromise;
        }
        this.isLoading = true;
        this.loadPromise = new Promise((resolve, reject) => {
            const tempImg = new Image();
            tempImg.src = href;
            tempImg.onload = () => {
                this.naturalWidth = tempImg.naturalWidth;
                this.naturalHeight = tempImg.naturalHeight;
                this.aspectRatio = this.naturalWidth / this.naturalHeight;
                this.href = href;
                this.isLoaded = true;
                this.isLoading = false;
                this.setSource(href).render();
                resolve({
                    naturalWidth: this.naturalWidth,
                    naturalHeight: this.naturalHeight,
                });
            };
            tempImg.onerror = (error) => {
                this.isLoading = false;
                console.error('Failed to load image:', href, error);
                reject(error);
            };
        });
        return this.loadPromise;
    }
    calculateDimensions() {
        if (!this.naturalWidth || !this.naturalHeight) {
            return { width: 0, height: 0 };
        }
        const plotWidth = this.manager.BasePlot.plotWidth;
        const plotHeight = this.manager.BasePlot.plotHeight;
        const ratioW = this.naturalWidth / plotWidth;
        const ratioH = this.naturalHeight / plotHeight;
        const ratio = Math.max(ratioW, ratioH, 1);
        const width = this.width ? this.width : this.naturalWidth / ratio;
        const height = this.width
            ? this.width / this.aspectRatio
            : this.naturalHeight / ratio;
        return { width, height };
    }
    calculatePosition() {
        const { width, height } = this.calculateDimensions();
        let x, y;
        if (this.coords) {
            if (this.useCornerCoords) {
                // Use corner coordinates directly (top-left corner)
                x = this.convertX(this.coords[0]);
                y = this.convertY(this.coords[1]);
            }
            else {
                // Use center coordinates
                const centerX = this.convertX(this.coords[0]);
                const centerY = this.convertY(this.coords[1]);
                x = centerX - width / 2;
                y = centerY - height / 2;
            }
        }
        else {
            // Default: center the image in the plot
            const plotWidth = this.manager.BasePlot.plotWidth;
            const plotHeight = this.manager.BasePlot.plotHeight;
            const centerX = plotWidth / 2;
            const centerY = plotHeight / 2;
            x = centerX - width / 2;
            y = centerY - height / 2;
        }
        return { x, y, width, height };
    }
    render(transitionDuration = 0, ease) {
        // Only update if image is loaded
        if (!this.isLoaded || !this.naturalWidth || !this.naturalHeight) {
            return d3.select(null);
        }
        const { x, y, width, height } = this.calculatePosition();
        const element = this.getElementWithTransition(this.element, transitionDuration, ease);
        return element
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('href', this.href)
            .attr('preserveAspectRatio', this.options.preserveAspectRatio);
    }
    isReady() {
        return this.isLoaded;
    }
    whenReady() {
        return this.loadPromise || Promise.resolve();
    }
}
export class BatchPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.dataPoints = [];
        this.elementSelection = d3.select(null);
    }
    setData(dataPoints, keyAccessor = (d, i) => i) {
        this.dataPoints = dataPoints;
        this.keyAccessor = keyAccessor;
        return this;
    }
    applyCommonStyles(element) {
        return super.applyCommonStyles(element).attr('class', this.options.className);
    }
    performDataJoin(elementType, transitionDuration = 0, ease) {
        if (!this.dataPoints) {
            this.elementSelection = d3.select(null);
            return d3.select(null);
        }
        const selection = this.element
            .selectAll(`.${this.options.className}`)
            .data(this.dataPoints, this.keyAccessor);
        selection.exit().remove();
        const enter = selection.enter().append(elementType);
        const merged = enter.merge(selection);
        this.elementSelection = merged;
        return this.getElementWithTransition(merged, transitionDuration, ease);
    }
    remove() {
        this.element.selectAll('*').remove();
        if (this.updateFunc) {
            const index = this.manager.BasePlot.updateFunctions.indexOf(this.updateFunc);
            if (index >= -1) {
                this.manager.BasePlot.updateFunctions.splice(index, 1);
            }
        }
    }
    attachEvent(event, handler) {
        if (this.options.pointerEvents === 'none') {
            this.options.pointerEvents = 'auto';
            this.elementSelection.attr('pointer-events', 'auto');
        }
        this.elementSelection.on(event, handler);
        return this;
    }
}
export class BatchPointsPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
    }
    setCoordinateAccessors(xAccessor, yAccessor) {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const finalSelection = this.performDataJoin('path', transitionDuration, ease);
        if (!this.dataPoints || finalSelection.empty())
            return d3.select(null);
        const symbolGenerator = d3.symbol();
        if (typeof this.options.symbolType === 'function') {
            symbolGenerator.type(this.options.symbolType);
        }
        else {
            symbolGenerator.type(this.options.symbolType);
        }
        if (typeof this.options.size === 'function') {
            symbolGenerator.size(this.options.size);
        }
        else {
            symbolGenerator.size(this.options.size);
        }
        return this.applyCommonStyles(finalSelection)
            .attr('d', symbolGenerator)
            .attr('transform', (d) => {
            const x = this.xAccessor(d);
            const y = this.yAccessor(d);
            if (x == null || y == null || isNaN(x) || isNaN(y)) {
                return null;
            }
            return `translate(${this.convertX(x)}, ${this.convertY(y)})`;
        });
    }
}
export class BatchLinesPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
    }
    setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor) {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const finalSelection = this.performDataJoin('line', transitionDuration, ease);
        if (!this.dataPoints || finalSelection.empty())
            return d3.select(null);
        let markerStart = null;
        let markerEnd = null;
        const strokeColor = typeof this.options.stroke === 'function'
            ? 'currentColor'
            : this.options.stroke;
        if (this.options.arrow === 'start' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(strokeColor, 'start');
            markerStart = `url(#${markerId})`;
        }
        if (this.options.arrow === 'end' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(strokeColor, 'end');
            markerEnd = `url(#${markerId})`;
        }
        return this.applyCommonStyles(finalSelection)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('opacity', (d) => {
            const x1 = this.x1Accessor(d);
            const y1 = this.y1Accessor(d);
            const x2 = this.x2Accessor(d);
            const y2 = this.y2Accessor(d);
            // Hide lines with invalid coordinates
            if (x1 == null ||
                y1 == null ||
                x2 == null ||
                y2 == null ||
                isNaN(x1) ||
                isNaN(y1) ||
                isNaN(x2) ||
                isNaN(y2)) {
                return 0;
            }
            return this.options.opacity;
        })
            .attr('marker-start', markerStart)
            .attr('marker-end', markerEnd)
            .attr('x1', (d) => {
            const val = this.x1Accessor(d);
            return val != null ? this.convertX(val) : 0;
        })
            .attr('y1', (d) => {
            const val = this.y1Accessor(d);
            return val != null ? this.convertY(val) : 0;
        })
            .attr('x2', (d) => {
            const val = this.x2Accessor(d);
            return val != null ? this.convertX(val) : 0;
        })
            .attr('y2', (d) => {
            const val = this.y2Accessor(d);
            return val != null ? this.convertY(val) : 0;
        });
    }
}
export class BatchRectanglesPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        if (options.x1Accessor)
            this.x1Accessor = options.x1Accessor;
        if (options.y1Accessor)
            this.y1Accessor = options.y1Accessor;
        if (options.x2Accessor)
            this.x2Accessor = options.x2Accessor;
        if (options.y2Accessor)
            this.y2Accessor = options.y2Accessor;
    }
    setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor) {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const finalSelection = this.performDataJoin('rect', transitionDuration, ease);
        if (!this.dataPoints || finalSelection.empty())
            return d3.select(null);
        return this.applyCommonStyles(finalSelection)
            .attr('opacity', (d) => {
            const x1 = this.x1Accessor(d);
            const y1 = this.y1Accessor(d);
            const x2 = this.x2Accessor(d);
            const y2 = this.y2Accessor(d);
            if (x1 == null ||
                y1 == null ||
                x2 == null ||
                y2 == null ||
                isNaN(x1) ||
                isNaN(y1) ||
                isNaN(x2) ||
                isNaN(y2)) {
                return 0;
            }
            return this.options.opacity;
        })
            .attr('x', (d) => {
            const x1Val = this.x1Accessor(d);
            const x2Val = this.x2Accessor(d);
            if (x1Val == null || x2Val == null)
                return 0;
            const x1 = this.convertX(x1Val);
            const x2 = this.convertX(x2Val);
            return Math.min(x1, x2);
        })
            .attr('y', (d) => {
            const y1Val = this.y1Accessor(d);
            const y2Val = this.y2Accessor(d);
            if (y1Val == null || y2Val == null)
                return 0;
            const y1 = this.convertY(y1Val);
            const y2 = this.convertY(y2Val);
            return Math.min(y1, y2);
        })
            .attr('width', (d) => {
            const x1Val = this.x1Accessor(d);
            const x2Val = this.x2Accessor(d);
            if (x1Val == null || x2Val == null)
                return 0;
            const x1 = this.convertX(x1Val);
            const x2 = this.convertX(x2Val);
            return Math.abs(x2 - x1);
        })
            .attr('height', (d) => {
            const y1Val = this.y1Accessor(d);
            const y2Val = this.y2Accessor(d);
            if (y1Val == null || y2Val == null)
                return 0;
            const y1 = this.convertY(y1Val);
            const y2 = this.convertY(y2Val);
            return Math.abs(y2 - y1);
        });
    }
}
export class BatchTextPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        if (options.xAccessor)
            this.xAccessor = options.xAccessor;
        if (options.yAccessor)
            this.yAccessor = options.yAccessor;
        if (options.textAccessor)
            this.textAccessor = options.textAccessor;
        if (options.angleAccessor)
            this.angleAccessor = options.angleAccessor;
    }
    setCoordinateAccessors(xAccessor, yAccessor) {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }
    setTextAccessor(textAccessor) {
        this.textAccessor = textAccessor;
        return this;
    }
    setAngleAccessor(angleAccessor) {
        this.angleAccessor = angleAccessor;
        return this;
    }
    render(transitionDuration = 0, ease) {
        const finalSelection = this.performDataJoin('text', transitionDuration, ease);
        if (!this.dataPoints || finalSelection.empty())
            return d3.select(null);
        return this.applyCommonStyles(finalSelection)
            .text((d) => this.textAccessor ? this.textAccessor(d) : d)
            .attr('x', (d) => {
            const val = this.xAccessor(d);
            return val != null ? this.convertX(val) : 0;
        })
            .attr('y', (d) => {
            const val = this.yAccessor(d);
            return val != null ? this.convertY(val) : 0;
        })
            .attr('text-anchor', this.options.anchor)
            .attr('dominant-baseline', this.options.baseline)
            .attr('font-family', this.options.fontFamily)
            .attr('font-size', this.options.fontSize)
            .attr('opacity', (d) => {
            const x = this.xAccessor(d);
            const y = this.yAccessor(d);
            // Hide text with invalid coordinates
            if (x == null || y == null || isNaN(x) || isNaN(y)) {
                return 0;
            }
            return this.options.opacity;
        })
            .attr('transform', (d) => {
            const angle = this.angleAccessor ? this.angleAccessor(d) : 0;
            if (angle) {
                const xVal = this.xAccessor(d);
                const yVal = this.yAccessor(d);
                if (xVal == null || yVal == null)
                    return null;
                const x = this.convertX(xVal);
                const y = this.convertY(yVal);
                return `rotate(${angle}, ${x}, ${y})`;
            }
            return null;
        });
    }
}
export const PrimitiveInfoMap = new Map([
    [PointPrimitive, { isBatch: false, svgElementType: 'path' }],
    [LinePrimitive, { isBatch: false, svgElementType: 'line' }],
    [RectanglePrimitive, { isBatch: false, svgElementType: 'rect' }],
    [TextPrimitive, { isBatch: false, svgElementType: 'text' }],
    [PathPrimitive, { isBatch: false, svgElementType: 'path' }],
    [AreaPrimitive, { isBatch: false, svgElementType: 'path' }],
    [ContourPrimitive, { isBatch: false, svgElementType: 'g' }],
    [ImagePrimitive, { isBatch: false, svgElementType: 'image' }],
    [BatchPointsPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchLinesPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchRectanglesPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchTextPrimitive, { isBatch: true, svgElementType: 'g' }],
]);
