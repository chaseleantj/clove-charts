import * as d3 from 'd3';

import PrimitiveManager from '@/components/plots/common/primitives/primitive-manager';
import type BasePlot from '@/components/plots/common/base';
import { PrimitiveConfig } from '@/components/plots/common/config';
import { CoordinateSystem } from '@/components/plots/common/types';
import { renderKatex } from '@/components/plots/common/utils';


type Element = d3.Selection<d3.BaseType, unknown, null, undefined>;
type ElementOrTransition = d3.Selection<d3.BaseType, unknown, null, undefined> | d3.Transition<d3.BaseType, unknown, null, undefined>;
type EasingFunction = ((t: number) => number);


export class Primitive {
    updateFunc: (() => void) | null;

    constructor(
        protected readonly manager: PrimitiveManager, 
        protected readonly element: Element, 
        public options: Required<PrimitiveConfig>
    ) {
        this.options = options;
        this.updateFunc = null;

        // Force elements to be static when using pixel coordinates
        if (this.options.coordinateSystem === CoordinateSystem.Pixel) {
            this.options.staticElement = true;
        }
    }

    setStyles(styles = {}) {
        this.options = { ...this.options, ...styles };
        return this;
    }

    // Converts coordinates based on coordinate system
    convertX(x: number) {
        return this.options.coordinateSystem === CoordinateSystem.Pixel
            ? x
            : this.manager.BasePlot.scale.x(x);
    }

    convertY(y: number) {
        return this.options.coordinateSystem === CoordinateSystem.Pixel
            ? y
            : this.manager.BasePlot.scale.y(y);
    }

    getElementWithTransition(element: Element, transitionDuration = 0, ease?: EasingFunction): ElementOrTransition {
        if (transitionDuration > 0) {
            let transitionElement = element.transition().duration(transitionDuration);
            if (ease) {
                transitionElement = transitionElement.ease(ease);
            }
            return transitionElement;
        }
        return element;
    }

    createUpdateFunction(updateCallback: (this: BasePlot) => void): this {
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
            const index = this.manager.BasePlot.updateFunctions.indexOf(
                this.updateFunc
            );
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
}

export interface PointPrimitiveOptions {
    size?: number;
    symbolType?: d3.SymbolType;
    // fill?: string;
    // stroke?: string;
    // strokeWidth?: number;
}

export class PointPrimitive extends Primitive {

    x?: number;
    y?: number;
    size: number;
    symbolType: d3.SymbolType;
    declare options: Required<PrimitiveConfig> & Required<PointPrimitiveOptions>;
    
    constructor(
            manager: PrimitiveManager, 
            element: Element, 
            options: Required<PrimitiveConfig> & Required<PointPrimitiveOptions>
        ) {
        super(manager, element, options);
        this.size = options.size;
        this.symbolType = options.symbolType;
    }

    setSize(size: number): PointPrimitive {
        this.size = size;
        return this;
    }

    setSymbolType(symbolType: d3.SymbolType): PointPrimitive {
        this.symbolType = symbolType;
        return this;
    }

    setCoords(x: number, y: number): PointPrimitive {
        this.x = x;
        this.y = y;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction): ElementOrTransition {
        // Cast to any due to TypeScript limitation: Selection and Transition both support
        // .attr() identically, but TypeScript can't properly infer overloads on union types
        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        ) as any;

        const symbolGenerator = d3
            .symbol()
            .type(this.symbolType)
            .size(this.size);

        return element
            .attr('d', symbolGenerator)
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr(
                'transform',
                `translate(${this.convertX(this.x!)}, ${this.convertY(this.y!)})`
            )
    }
}

export interface LinePrimitiveOptions {
    arrow?: 'start' | 'end' | 'both' | 'none',
    // stroke?: string,
    // strokeWidth?: number,
    strokeDashArray?: string,
    strokeDashOffset?: number
}

export class LinePrimitive extends Primitive {

    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    declare options: Required<PrimitiveConfig> & Required<LinePrimitiveOptions>;

    constructor(
            manager: PrimitiveManager, 
            element: Element, 
            options: Required<PrimitiveConfig> & Required<LinePrimitiveOptions>
        ) {
        super(manager, element, options);
    }

    setCoords(x1: number, y1: number, x2: number, y2: number): LinePrimitive {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction): ElementOrTransition {
        let markerStart = null;
        let markerEnd = null;

        if (this.options.arrow === 'start' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(
                this.options.stroke,
                'start'
            );
            markerStart = `url(#${markerId})`;
        }
        if (this.options.arrow === 'end' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(
                this.options.stroke,
                'end'
            );
            markerEnd = `url(#${markerId})`;
        }

        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        ) as any;

        return element
            .attr('x1', this.convertX(this.x1!))
            .attr('y1', this.convertY(this.y1!))
            .attr('x2', this.convertX(this.x2!))
            .attr('y2', this.convertY(this.y2!))
            .attr('marker-start', markerStart)
            .attr('marker-end', markerEnd)
            .attr('opacity', this.options.opacity)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset);
    }
}

export interface RectanglePrimitiveOptions {
    // fill?: string;
    // stroke?: string;
    // strokeWidth?: number;
}

export class RectanglePrimitive extends Primitive {

    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    declare options: Required<PrimitiveConfig> & Required<RectanglePrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<RectanglePrimitiveOptions>
    ) {
        super(manager, element, options);
    }

    setCoords(x1: number, y1: number, x2: number, y2: number): RectanglePrimitive {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction): ElementOrTransition {
        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        ) as any;

        const scaledX1 = this.convertX(this.x1!);
        const scaledY1 = this.convertY(this.y1!);
        const scaledX2 = this.convertX(this.x2!);
        const scaledY2 = this.convertY(this.y2!);

        const rectX = Math.min(scaledX1, scaledX2);
        const rectY = Math.min(scaledY1, scaledY2);
        const rectWidth = Math.abs(scaledX2 - scaledX1);
        const rectHeight = Math.abs(scaledY2 - scaledY1);

        return element
            .attr('x', rectX)
            .attr('y', rectY)
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity);
    }
}

export interface TextPrimitiveOptions {
    fontSize?: number;
    fontFamily?: string | null;
    // fill?: string;
    anchor?: 'start' | 'middle' | 'end';
    baseline?: 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top';
    angle?: number;
    latex?: boolean;
}

// Currently does not support animations with latex rendering
export class TextPrimitive extends Primitive {

    x?: number;
    y?: number;
    angle: number;
    text: string;
    declare options: Required<PrimitiveConfig> & Required<TextPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<TextPrimitiveOptions>
    ) {
        super(manager, element, options);
        this.text = '';
        this.angle = options.angle;
    }

    setText(text: string): TextPrimitive {
        this.text = text;
        if (!this.options.latex) {
            this.element.text(text);
        }
        return this;
    }

    setAngle(angle: number): TextPrimitive {
        this.angle = angle;
        return this;
    }

    setCoords(x: number, y: number): TextPrimitive {
        this.x = x;
        this.y = y;
        return this;
    }

    render(duration = 0, ease?: EasingFunction): ElementOrTransition {
        let element = this.getElementWithTransition(
            this.element,
            duration,
            ease
        ) as any;
        const x = this.convertX(this.x!);
        const y = this.convertY(this.y!);

        if (this.options.latex) {
            element = this.renderKatex(element, x, y);
        } else {
            element = this.renderPlainText(element, x, y);
        }

        element.attr('opacity', this.options.opacity);

        return element;
    }

    renderPlainText(element: any, x: number, y: number): ElementOrTransition {
        element
            .attr('x', x)
            .attr('y', y)
            .attr('font-size', this.options.fontSize)
            .attr('font-family', this.options.fontFamily)
            .attr('text-anchor', this.options.anchor)
            .attr('dominant-baseline', this.options.baseline)
            .attr('fill', this.options.fill)
            .text(this.text);

        if (this.angle) {
            element.attr('transform', `rotate(${this.angle}, ${x}, ${y})`);
        }

        return element;
    }

    renderKatex(element: any, x: number, y: number): any {
        return renderKatex(this.text, element, x, y, this.angle);
    }
}

export class PathPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'path';
        this.dataPoints = null;
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

    render(transitionDuration = 0, ease = null) {
        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        );

        const lineGenerator = d3
            .line()
            .x((d) => this.convertX(this.xAccessor(d)))
            .y((d) => this.convertY(this.yAccessor(d)))
            .defined(
                (d) => this.xAccessor(d) != null && this.yAccessor(d) != null
            )
            .curve(this.options.curve);

        element
            .attr('fill', this.options.fill)
            .attr('opacity', this.options.opacity)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('d', lineGenerator(this.dataPoints));
    }
}

export class ContourPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'contour';
        this.elementSelection = d3.select(null);

        this.fValues = null;
        this.xRange = null;
        this.yRange = null;
    }

    _calculateContours(fValues, xRange, yRange, thresholds) {
        const resolutionX = xRange.length;
        const resolutionY = yRange.length;

        return d3
            .contours()
            .size([resolutionX, resolutionY])
            .thresholds(thresholds)(fValues);
    }

    _createPathGenerator(xRange, yRange) {
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

        return d3.geoPath().projection(
            d3.geoTransform({
                point: function (x, y) {
                    this.stream.point(
                        self.convertX(idxToDomainX(x)),
                        self.convertY(idxToDomainY(y))
                    );
                },
            })
        );
    }

    setData(fValues, xRange, yRange) {
        this.fValues = fValues;
        this.xRange = xRange;
        this.yRange = yRange;
        return this;
    }

    render(transitionDuration = 0, ease = null) {
        const contours = this._calculateContours(
            this.fValues,
            this.xRange,
            this.yRange,
            this.options.thresholds
        );
        const pathGenerator = this._createPathGenerator(
            this.xRange,
            this.yRange
        );

        const selection = this.element
            .selectAll(`path.${this.options.className}`)
            .data(contours, (d, i) => i);

        selection.exit().remove();
        const enter = selection.enter().append('path');
        const merged = enter.merge(selection);

        this.elementSelection = merged;

        const finalSelection = this.getElementWithTransition(
            merged,
            transitionDuration,
            ease
        );

        return finalSelection
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('fill', (d) =>
                this.options.colorScale
                    ? this.options.colorScale(d.value)
                    : 'none'
            )
            .attr('class', this.options.className)
            .attr('d', pathGenerator);
    }
}

export class ImagePrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'image';
        this.href = null;

        this.naturalWidth = null;
        this.naturalHeight = null;
        this.aspectRatio = null;

        this.useCornerCoords = options.useCornerCoords || false;
        this.preserveAspectRatio =
            options.preserveAspectRatio || 'xMidYMid meet';

        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;

        this.coords = options.coords || null;
        this.width = options.width || null;
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

                // Call onLoad callback if provided
                if (this.options.onLoad) {
                    this.options.onLoad(this, {
                        naturalWidth: this.naturalWidth,
                        naturalHeight: this.naturalHeight,
                    });
                }

                resolve({
                    naturalWidth: this.naturalWidth,
                    naturalHeight: this.naturalHeight,
                });
            };

            tempImg.onerror = (error) => {
                this.isLoading = false;
                console.error('Failed to load image:', href, error);

                // Call onError callback if provided
                if (this.options.onError) {
                    this.options.onError(error);
                }

                reject(error);
            };
        });

        return this.loadPromise;
    }

    _calculateDimensions() {
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

    _calculatePosition() {
        const { width, height } = this._calculateDimensions();
        let x, y;

        if (this.coords) {
            if (this.useCornerCoords) {
                // Use corner coordinates directly (top-left corner)
                x = this.convertX(this.coords[0]);
                y = this.convertY(this.coords[1]);
            } else {
                // Use center coordinates
                const centerX = this.convertX(this.coords[0]);
                const centerY = this.convertY(this.coords[1]);
                x = centerX - width / 2;
                y = centerY - height / 2;
            }
        } else {
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

    render(transitionDuration = 0, ease = null) {
        // Only update if image is loaded
        if (!this.isLoaded || !this.naturalWidth || !this.naturalHeight) {
            return null;
        }

        const { x, y, width, height } = this._calculatePosition();

        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        );

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

    // Method to wait for image to load
    whenReady() {
        return this.loadPromise || Promise.resolve();
    }
}

export class BatchPrimitive extends Primitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.dataArray = null;
        this.xAccessor = null;
        this.yAccessor = null;
        this.keyAccessor = null;
        this.elementSelection = d3.select(null);
    }

    setData(dataArray, keyAccessor = (d, i) => i) {
        this.dataArray = dataArray;
        this.keyAccessor = keyAccessor;
        return this;
    }

    _performDataJoin(elementType, transitionDuration = 0, ease = null) {
        if (!this.dataArray) {
            this.elementSelection = d3.select(null);
            return d3.select(null);
        }

        const selection = this.element
            .selectAll(`.${this.options.className}`)
            .data(this.dataArray, this.keyAccessor);

        selection.exit().remove();
        const enter = selection.enter().append(elementType);
        const merged = enter.merge(selection);

        this.elementSelection = merged;

        return this.getElementWithTransition(merged, transitionDuration, ease);
    }

    render(transitionDuration = 0) {
        // To be implemented by subclasses
        throw new Error('apply method must be implemented by subclass');
    }

    remove() {
        this.element.selectAll('*').remove();
        if (this.updateFunc) {
            const index = this.manager.BasePlot.updateFunctions.indexOf(
                this.updateFunc
            );
            if (index > -1) {
                this.manager.BasePlot.updateFunctions.splice(index, 1);
            }
        }
    }
}

export class BatchPointsPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'batch-points';
        this.size = options.size || 64;
        this.symbolType = options.symbolType || d3.symbolCircle;
    }

    setSize(size) {
        this.size = size;
        return this;
    }

    setSymbolType(symbolType) {
        this.symbolType = symbolType;
        return this;
    }

    setCoordinateAccessors(xAccessor, yAccessor) {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }

    render(transitionDuration = 0, ease = null) {
        const finalSelection = this._performDataJoin(
            'path',
            transitionDuration,
            ease
        );
        if (!this.dataArray || finalSelection.empty()) return;

        const symbolGenerator = d3
            .symbol()
            .type(this.symbolType)
            .size(this.size);

        return finalSelection
            .attr('d', symbolGenerator)
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('class', this.options.className)
            .attr(
                'transform',
                (d) =>
                    `translate(${this.convertX(this.xAccessor(d))}, ${this.convertY(this.yAccessor(d))})`
            );
    }
}

export class BatchLinesPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'batch-lines';
        this.x1Accessor = options.x1Accessor;
        this.y1Accessor = options.y1Accessor;
        this.x2Accessor = options.x2Accessor;
        this.y2Accessor = options.y2Accessor;
    }

    setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor) {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }

    render(transitionDuration = 0, ease = null) {
        const finalSelection = this._performDataJoin(
            'line',
            transitionDuration,
            ease
        );
        if (!this.dataArray || finalSelection.empty()) return;

        // Add arrow markers similar to addLine
        let markerStart = null;
        let markerEnd = null;

        if (this.options.arrow === 'start' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(
                this.options.stroke,
                'start'
            );
            markerStart = `url(#${markerId})`;
        }
        if (this.options.arrow === 'end' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(
                this.options.stroke,
                'end'
            );
            markerEnd = `url(#${markerId})`;
        }

        return finalSelection
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('opacity', this.options.opacity)
            .attr('class', this.options.className)
            .attr('marker-start', markerStart)
            .attr('marker-end', markerEnd)
            .attr('x1', (d) => this.convertX(this.x1Accessor(d)))
            .attr('y1', (d) => this.convertY(this.y1Accessor(d)))
            .attr('x2', (d) => this.convertX(this.x2Accessor(d)))
            .attr('y2', (d) => this.convertY(this.y2Accessor(d)));
    }
}

export class BatchRectanglesPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'batch-rectangles';
        this.x1Accessor = options.x1Accessor;
        this.y1Accessor = options.y1Accessor;
        this.x2Accessor = options.x2Accessor;
        this.y2Accessor = options.y2Accessor;
    }

    setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor) {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }

    render(transitionDuration = 0, ease = null) {
        const finalSelection = this._performDataJoin(
            'rect',
            transitionDuration,
            ease
        );
        if (!this.dataArray || finalSelection.empty()) return;

        return finalSelection
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('class', this.options.className)
            .attr('x', (d) => {
                const x1 = this.convertX(this.x1Accessor(d));
                const x2 = this.convertX(this.x2Accessor(d));
                return Math.min(x1, x2);
            })
            .attr('y', (d) => {
                const y1 = this.convertY(this.y1Accessor(d));
                const y2 = this.convertY(this.y2Accessor(d));
                return Math.min(y1, y2);
            })
            .attr('width', (d) => {
                const x1 = this.convertX(this.x1Accessor(d));
                const x2 = this.convertX(this.x2Accessor(d));
                return Math.abs(x2 - x1);
            })
            .attr('height', (d) => {
                const y1 = this.convertY(this.y1Accessor(d));
                const y2 = this.convertY(this.y2Accessor(d));
                return Math.abs(y2 - y1);
            });
    }
}

export class BatchTextPrimitive extends BatchPrimitive {
    constructor(manager, element, options) {
        super(manager, element, options);
        this.type = 'batch-text';
        this.xAccessor = options.xAccessor;
        this.yAccessor = options.yAccessor;
        this.textAccessor = options.textAccessor;
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

    render(transitionDuration = 0, ease = null) {
        const finalSelection = this._performDataJoin(
            'text',
            transitionDuration,
            ease
        );
        if (!this.dataArray || finalSelection.empty()) return;

        return finalSelection
            .text((d) => (this.textAccessor ? this.textAccessor(d) : d))
            .attr('x', (d) => this.convertX(this.xAccessor(d)))
            .attr('y', (d) => this.convertY(this.yAccessor(d)))
            .attr('text-anchor', this.options.anchor)
            .attr('dominant-baseline', this.options.baseline)
            .attr('font-family', this.options.fontFamily)
            .attr('font-size', this.options.fontSize)
            .attr('fill', this.options.fill)
            .attr('opacity', this.options.opacity)
            .attr('class', this.options.className)
            .attr('transform', (d) => {
                const angle = this.angleAccessor ? this.angleAccessor(d) : 0;
                if (angle) {
                    const x = this.convertX(this.xAccessor(d));
                    const y = this.convertY(this.yAccessor(d));
                    return `rotate(${angle}, ${x}, ${y})`;
                }
                return null;
            });
    }
}

type PrimitiveConstructor = new (manager: any, element: any, options: any) => Primitive;

export type PrimitiveInfo = { isBatch: boolean; htmlElementType: string }

export const PRIMITIVE_LOOKUP = new Map<PrimitiveConstructor, PrimitiveInfo>([
    [PointPrimitive, { isBatch: false, htmlElementType: 'path' }],
    [LinePrimitive, { isBatch: false, htmlElementType: 'line' }],
    [RectanglePrimitive, { isBatch: false, htmlElementType: 'rect' }],
    [TextPrimitive, { isBatch: false, htmlElementType: 'text' }],
    [PathPrimitive, { isBatch: false, htmlElementType: 'path' }],
    [ContourPrimitive, { isBatch: false, htmlElementType: 'g' }],
    [ImagePrimitive, { isBatch: false, htmlElementType: 'image' }],
    [BatchPointsPrimitive, { isBatch: true, htmlElementType: 'g' }],
    [BatchLinesPrimitive, { isBatch: true, htmlElementType: 'g' }],
    [BatchRectanglesPrimitive, { isBatch: true, htmlElementType: 'g' }],
    [BatchTextPrimitive, { isBatch: true, htmlElementType: 'g' }],
]);