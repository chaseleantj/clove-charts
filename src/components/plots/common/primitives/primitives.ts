import * as d3 from 'd3';

import PrimitiveManager from '@/components/plots/common/primitives/primitive-manager';
import type BasePlot from '@/components/plots/common/base';
import { isContinuousScale } from '@/components/plots/common/scale-manager';
import {
    PrimitiveConfig,
    BatchPrimitiveConfig,
    DataDrivenValue,
} from '@/components/plots/common/config';
import { CoordinateSystem } from '@/components/plots/common/types';
import { renderKatex } from '@/components/plots/common/utils';

type Element = d3.Selection<d3.BaseType, unknown, null, undefined>;
type ElementOrTransition =
    | d3.Selection<d3.BaseType, unknown, null, undefined>
    | d3.Transition<d3.BaseType, unknown, null, undefined>;
type EasingFunction = (t: number) => number;
export type CoordinateAccessor = (
    d: Record<string, any>
) => number | null | undefined;

export class Primitive<
    TConfig extends PrimitiveConfig<any, any, any, any> = PrimitiveConfig,
> {
    updateFunc: (() => void) | null;
    declare options: Required<TConfig>;

    constructor(
        protected readonly manager: PrimitiveManager,
        protected readonly element: Element,
        options: Required<TConfig>
    ) {
        this.options = options;
        this.updateFunc = null;

        // Force elements to be static when using pixel coordinates
        if (this.options.coordinateSystem === CoordinateSystem.Pixel) {
            this.options.staticElement = true;
        }
    }

    public setStyles(styles = {}) {
        this.options = { ...this.options, ...styles };
        return this;
    }

    // Converts coordinates based on coordinate system
    public convertX(x: number): number {
        if (this.options.coordinateSystem === CoordinateSystem.Pixel) {
            return x;
        }
        const scale = this.manager.BasePlot.scale.x;
        return isContinuousScale(scale) ? scale(x) : x;
    }

    public convertY(y: number): number {
        if (this.options.coordinateSystem === CoordinateSystem.Pixel) {
            return y;
        }
        const scale = this.manager.BasePlot.scale.y;
        return isContinuousScale(scale) ? scale(y) : y;
    }

    protected getElementWithTransition<
        GElement extends d3.BaseType,
        Datum,
        PElement extends d3.BaseType,
        PDatum,
    >(
        element: d3.Selection<GElement, Datum, PElement, PDatum>,
        transitionDuration = 0,
        ease?: EasingFunction
    ):
        | d3.Selection<GElement, Datum, PElement, PDatum>
        | d3.Transition<GElement, Datum, PElement, PDatum> {
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

    public createUpdateFunction(
        updateCallback: (this: BasePlot) => void
    ): this {
        if (!this.options.staticElement) {
            this.updateFunc = updateCallback.bind(this.manager.BasePlot);
            this.manager.BasePlot.addUpdateFunction(this.updateFunc);
        }
        return this;
    }

    public update() {
        if (this.updateFunc) {
            this.updateFunc();
        }
    }

    public remove() {
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

    public show() {
        this.element.style('opacity', this.options.opacity);
        return this;
    }

    public hide() {
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
    declare options: Required<PrimitiveConfig> &
        Required<PointPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<PointPrimitiveOptions>
    ) {
        super(manager, element, options);
        this.size = options.size;
        this.symbolType = options.symbolType;
    }

    public setSize(size: number): this {
        this.size = size;
        return this;
    }

    public setSymbolType(symbolType: d3.SymbolType): this {
        this.symbolType = symbolType;
        return this;
    }

    public setCoords(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    public render(transitionDuration = 0, ease?: EasingFunction) {
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
            );
    }
}

export interface LinePrimitiveOptions {
    arrow?: 'start' | 'end' | 'both' | 'none';
    // stroke?: string,
    // strokeWidth?: number,
    strokeDashArray?: string;
    strokeDashOffset?: number;
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

    public setCoords(x1: number, y1: number, x2: number, y2: number): this {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    public render(transitionDuration = 0, ease?: EasingFunction) {
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
    declare options: Required<PrimitiveConfig> &
        Required<RectanglePrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<RectanglePrimitiveOptions>
    ) {
        super(manager, element, options);
    }

    public setCoords(x1: number, y1: number, x2: number, y2: number): this {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    public render(transitionDuration = 0, ease?: EasingFunction) {
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
    baseline?:
        | 'auto'
        | 'text-bottom'
        | 'alphabetic'
        | 'ideographic'
        | 'middle'
        | 'central'
        | 'mathematical'
        | 'hanging'
        | 'text-top';
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

    public setText(text: string): this {
        this.text = text;
        if (!this.options.latex) {
            this.element.text(text);
        }
        return this;
    }

    public setAngle(angle: number): this {
        this.angle = angle;
        return this;
    }

    public setCoords(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    public render(duration = 0, ease?: EasingFunction) {
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

    private renderPlainText(
        element: any,
        x: number,
        y: number
    ): ElementOrTransition {
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

    private renderKatex(element: any, x: number, y: number): any {
        return renderKatex(this.text, element, x, y, this.angle);
    }
}

export interface PathPrimitiveOptions {
    strokeDashArray?: string;
    strokeDashOffset?: number;
    curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
}

export class PathPrimitive extends Primitive {
    dataPoints: Record<string, any>[];
    xAccessor!: CoordinateAccessor;
    yAccessor!: CoordinateAccessor;
    declare options: Required<PrimitiveConfig> & Required<PathPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<PathPrimitiveOptions>
    ) {
        super(manager, element, options);
        this.dataPoints = [];
    }

    public setData(dataPoints: Record<string, any>[]): this {
        this.dataPoints = dataPoints;
        return this;
    }

    public setCoordinateAccessors(
        xAccessor: CoordinateAccessor,
        yAccessor: CoordinateAccessor
    ): this {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }

    public render(transitionDuration = 0, ease?: EasingFunction) {
        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        ) as any;

        const lineGenerator = d3
            .line<Record<string, any>>()
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

        return element
            .attr('fill', this.options.fill)
            .attr('opacity', this.options.opacity)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('d', lineGenerator(this.dataPoints));
    }
}

export interface ContourPrimitiveOptions {
    thresholds?: number | number[];
    colorScale?: d3.ScaleSequential<string, never> | ((t: number) => string);
}

export class ContourPrimitive extends Primitive {
    fValues: number[];
    xRange: number[];
    yRange: number[];
    declare options: Required<PrimitiveConfig> &
        Required<ContourPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<ContourPrimitiveOptions>
    ) {
        super(manager, element, options);
        // this.elementSelection = d3.select(null);

        this.fValues = [];
        this.xRange = [];
        this.yRange = [];
    }

    private calculateContours(
        fValues: number[],
        xRange: number[],
        yRange: number[],
        thresholds: number | number[]
    ): d3.ContourMultiPolygon[] {
        const resolutionX = xRange.length;
        const resolutionY = yRange.length;

        return d3
            .contours()
            .size([resolutionX, resolutionY])
            .thresholds(thresholds)(fValues);
    }

    private createPathGenerator(
        xRange: number[],
        yRange: number[]
    ): d3.GeoPath<any, d3.GeoPermissibleObjects> {
        const resolutionX = xRange.length;
        const resolutionY = yRange.length;
        const domainX = d3.extent<number>(xRange) as [number, number];
        const domainY = d3.extent<number>(yRange) as [number, number];

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

    public setData(
        fValues: number[],
        xRange: number[],
        yRange: number[]
    ): this {
        this.fValues = fValues;
        this.xRange = xRange;
        this.yRange = yRange;
        return this;
    }

    public render(transitionDuration = 0, ease?: EasingFunction) {
        const contours = this.calculateContours(
            this.fValues,
            this.xRange,
            this.yRange,
            this.options.thresholds
        );
        const pathGenerator = this.createPathGenerator(
            this.xRange,
            this.yRange
        );

        const selection = this.element
            .selectAll<
                SVGPathElement,
                d3.ContourMultiPolygon
            >(`path.${this.options.className}`)
            .data(contours, (d, i) => i);

        selection.exit().remove();
        const enter = selection.enter().append('path');
        const merged = enter.merge(selection);

        // this.elementSelection = merged;

        const finalSelection = this.getElementWithTransition(
            merged,
            transitionDuration,
            ease
        ) as any;

        return finalSelection
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('fill', (d: { value: number }) =>
                this.options.colorScale
                    ? this.options.colorScale(d.value)
                    : 'none'
            )
            .attr('class', this.options.className)
            .attr('d', pathGenerator);
    }
}

export interface ImagePrimitiveOptions {
    width?: number | null;
    coords?: [number, number] | null;
    useCornerCoords?: boolean;
    preserveAspectRatio?: string;
}

export class ImagePrimitive extends Primitive {
    declare options: Required<PrimitiveConfig> &
        Required<ImagePrimitiveOptions>;

    width: number | null;
    coords: [number, number] | null;
    useCornerCoords: boolean;
    preserveAspectRatio: string;

    href!: string;
    naturalWidth!: number;
    naturalHeight!: number;
    aspectRatio!: number;

    isLoading: boolean;
    isLoaded: boolean;
    loadPromise!: Promise<unknown>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<PrimitiveConfig> & Required<ImagePrimitiveOptions>
    ) {
        super(manager, element, options);

        this.useCornerCoords = options.useCornerCoords;
        this.preserveAspectRatio = options.preserveAspectRatio;

        this.isLoaded = false;
        this.isLoading = false;

        this.width = options.width;
        this.coords = options.coords;
    }

    public setSource(href: string): this {
        this.href = href;
        return this;
    }

    public setCoords(coords: [number, number]): this {
        this.coords = coords;
        return this;
    }

    public setWidth(width: number): this {
        this.width = width;
        return this;
    }

    public loadImage(href: string): Promise<unknown> {
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

    private calculateDimensions(): { width: number; height: number } {
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

    private calculatePosition(): {
        x: number;
        y: number;
        width: number;
        height: number;
    } {
        const { width, height } = this.calculateDimensions();
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

    public render(transitionDuration = 0, ease?: EasingFunction) {
        // Only update if image is loaded
        if (!this.isLoaded || !this.naturalWidth || !this.naturalHeight) {
            return null;
        }

        const { x, y, width, height } = this.calculatePosition();

        const element = this.getElementWithTransition(
            this.element,
            transitionDuration,
            ease
        ) as any;

        return element
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
            .attr('href', this.href)
            .attr('preserveAspectRatio', this.options.preserveAspectRatio);
    }

    public isReady(): boolean {
        return this.isLoaded;
    }

    public whenReady(): Promise<unknown> {
        return this.loadPromise || Promise.resolve();
    }
}

export class BatchPrimitive extends Primitive<BatchPrimitiveConfig> {
    dataPoints: Record<string, any>[];

    xAccessor!: CoordinateAccessor;
    yAccessor!: CoordinateAccessor;
    keyAccessor!: (d: Record<string, any>, i: number) => number;

    elementSelection:
        | d3.Selection<
              | SVGPathElement
              | SVGLineElement
              | SVGRectElement
              | SVGTextElement
              | SVGImageElement
              | SVGGElement,
              Record<string, any>,
              d3.BaseType,
              unknown
          >
        | d3.Selection<null, unknown, null, undefined>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<BatchPrimitiveConfig>
    ) {
        super(manager, element, options);
        this.dataPoints = [];
        this.elementSelection = d3.select(null);
    }

    public setData(
        dataPoints: Record<string, any>[],
        keyAccessor = (d: Record<string, any>, i: number) => i
    ): this {
        this.dataPoints = dataPoints;
        this.keyAccessor = keyAccessor;
        return this;
    }

    protected performDataJoin(
        elementType: SVGElementType,
        transitionDuration = 0,
        ease?: EasingFunction
    ):
        | d3.Selection<
              | SVGPathElement
              | SVGLineElement
              | SVGRectElement
              | SVGTextElement
              | SVGImageElement
              | SVGGElement,
              Record<string, any>,
              d3.BaseType,
              unknown
          >
        | d3.Transition<
              | SVGPathElement
              | SVGLineElement
              | SVGRectElement
              | SVGTextElement
              | SVGImageElement
              | SVGGElement,
              Record<string, any>,
              d3.BaseType,
              unknown
          >
        | d3.Selection<null, unknown, null, undefined> {
        if (!this.dataPoints) {
            this.elementSelection = d3.select(null);
            return d3.select(null);
        }

        const selection = this.element
            .selectAll<
                | SVGPathElement
                | SVGLineElement
                | SVGRectElement
                | SVGTextElement
                | SVGImageElement
                | SVGGElement,
                Record<string, any>
            >(`.${this.options.className}`)
            .data(this.dataPoints, this.keyAccessor);

        selection.exit().remove();
        const enter = selection.enter().append(elementType);
        const merged = enter.merge(selection);

        this.elementSelection = merged;

        return this.getElementWithTransition(merged, transitionDuration, ease);
    }

    public render(transitionDuration = 0) {
        // To be implemented by subclasses
        throw new Error('apply method must be implemented by subclass');
    }

    public remove(): void {
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

export interface BatchPointsPrimitiveOptions {
    size?: DataDrivenValue<number>;
    symbolType?: DataDrivenValue<d3.SymbolType>;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}

export class BatchPointsPrimitive extends BatchPrimitive {
    size: DataDrivenValue<number>;
    symbolType: DataDrivenValue<d3.SymbolType>;

    xAccessor!: CoordinateAccessor;
    yAccessor!: CoordinateAccessor;

    declare options: Required<BatchPrimitiveConfig> &
        Required<BatchPointsPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<BatchPrimitiveConfig> &
            Required<BatchPointsPrimitiveOptions>
    ) {
        super(manager, element, options);
        this.size = options.size;
        this.symbolType = options.symbolType;
    }

    setSize(size: DataDrivenValue<number>): this {
        this.size = size;
        return this;
    }

    setSymbolType(symbolType: DataDrivenValue<d3.SymbolType>): this {
        this.symbolType = symbolType;
        return this;
    }

    setCoordinateAccessors(
        xAccessor: CoordinateAccessor,
        yAccessor: CoordinateAccessor
    ): this {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction) {
        const finalSelection = this.performDataJoin(
            'path',
            transitionDuration,
            ease
        ) as any;

        if (!this.dataPoints || finalSelection.empty()) return;

        // console.log(this.dataPoints); // shows correct datapoints

        const symbolGenerator = d3.symbol();

        if (typeof this.symbolType === 'function') {
            symbolGenerator.type(
                this.symbolType as (d: Record<string, any>) => d3.SymbolType
            );
        } else {
            symbolGenerator.type(this.symbolType as d3.SymbolType);
        }

        if (typeof this.size === 'function') {
            symbolGenerator.size(
                this.size as (d: Record<string, any>) => number
            );
        } else {
            symbolGenerator.size(this.size as number);
        }

        return finalSelection
            .attr('d', symbolGenerator)
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', this.options.opacity)
            .attr('class', this.options.className)
            .attr('transform', (d: Record<string, any>) => {
                const x = this.xAccessor(d);
                const y = this.yAccessor(d);

                console.log(x, y);

                // Handle null/undefined coordinates
                if (x == null || y == null || isNaN(x) || isNaN(y)) {
                    return null; // Hide invalid points
                }

                return `translate(${this.convertX(x)}, ${this.convertY(y)})`;
            });
    }
}

export interface BatchLinesPrimitiveOptions {
    x1Accessor?: CoordinateAccessor;
    y1Accessor?: CoordinateAccessor;
    x2Accessor?: CoordinateAccessor;
    y2Accessor?: CoordinateAccessor;
    arrow?: 'start' | 'end' | 'both' | 'none';
    strokeDashArray?: string;
    strokeDashOffset?: number;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}

export class BatchLinesPrimitive extends BatchPrimitive {
    x1Accessor!: CoordinateAccessor;
    y1Accessor!: CoordinateAccessor;
    x2Accessor!: CoordinateAccessor;
    y2Accessor!: CoordinateAccessor;

    declare options: Required<BatchPrimitiveConfig> &
        Required<BatchLinesPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<BatchPrimitiveConfig> &
            Required<BatchLinesPrimitiveOptions>
    ) {
        super(manager, element, options);
    }

    setCoordinateAccessors(
        x1Accessor: CoordinateAccessor,
        y1Accessor: CoordinateAccessor,
        x2Accessor: CoordinateAccessor,
        y2Accessor: CoordinateAccessor
    ): BatchLinesPrimitive {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction) {
        const finalSelection = this.performDataJoin(
            'line',
            transitionDuration,
            ease
        ) as any;

        if (!this.dataPoints || finalSelection.empty()) return;

        // Add arrow markers similar to addLine
        // Note: Arrow markers only support constant colors, not data-driven functions
        let markerStart: string | null = null;
        let markerEnd: string | null = null;

        const strokeColor =
            typeof this.options.stroke === 'function'
                ? 'currentColor' // Fallback for data-driven stroke
                : this.options.stroke;

        if (this.options.arrow === 'start' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(
                strokeColor,
                'start'
            );
            markerStart = `url(#${markerId})`;
        }
        if (this.options.arrow === 'end' || this.options.arrow === 'both') {
            const markerId = this.manager.createArrowMarker(strokeColor, 'end');
            markerEnd = `url(#${markerId})`;
        }

        return finalSelection
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('stroke-dasharray', this.options.strokeDashArray)
            .attr('stroke-dashoffset', this.options.strokeDashOffset)
            .attr('opacity', (d: Record<string, any>) => {
                const x1 = this.x1Accessor(d);
                const y1 = this.y1Accessor(d);
                const x2 = this.x2Accessor(d);
                const y2 = this.y2Accessor(d);
                // Hide lines with invalid coordinates
                if (
                    x1 == null ||
                    y1 == null ||
                    x2 == null ||
                    y2 == null ||
                    isNaN(x1) ||
                    isNaN(y1) ||
                    isNaN(x2) ||
                    isNaN(y2)
                ) {
                    return 0;
                }
                return this.options.opacity;
            })
            .attr('class', this.options.className)
            .attr('marker-start', markerStart)
            .attr('marker-end', markerEnd)
            .attr('x1', (d: Record<string, any>) => {
                const val = this.x1Accessor(d);
                return val != null ? this.convertX(val) : 0;
            })
            .attr('y1', (d: Record<string, any>) => {
                const val = this.y1Accessor(d);
                return val != null ? this.convertY(val) : 0;
            })
            .attr('x2', (d: Record<string, any>) => {
                const val = this.x2Accessor(d);
                return val != null ? this.convertX(val) : 0;
            })
            .attr('y2', (d: Record<string, any>) => {
                const val = this.y2Accessor(d);
                return val != null ? this.convertY(val) : 0;
            });
    }
}

export interface BatchRectanglesPrimitiveOptions {
    x1Accessor?: CoordinateAccessor;
    y1Accessor?: CoordinateAccessor;
    x2Accessor?: CoordinateAccessor;
    y2Accessor?: CoordinateAccessor;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}

export class BatchRectanglesPrimitive extends BatchPrimitive {
    x1Accessor!: CoordinateAccessor;
    y1Accessor!: CoordinateAccessor;
    x2Accessor!: CoordinateAccessor;
    y2Accessor!: CoordinateAccessor;

    declare options: Required<BatchPrimitiveConfig> &
        Required<BatchRectanglesPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<BatchPrimitiveConfig> &
            Required<BatchRectanglesPrimitiveOptions>
    ) {
        super(manager, element, options);
        if (options.x1Accessor) this.x1Accessor = options.x1Accessor;
        if (options.y1Accessor) this.y1Accessor = options.y1Accessor;
        if (options.x2Accessor) this.x2Accessor = options.x2Accessor;
        if (options.y2Accessor) this.y2Accessor = options.y2Accessor;
    }

    setCoordinateAccessors(
        x1Accessor: CoordinateAccessor,
        y1Accessor: CoordinateAccessor,
        x2Accessor: CoordinateAccessor,
        y2Accessor: CoordinateAccessor
    ): this {
        this.x1Accessor = x1Accessor;
        this.y1Accessor = y1Accessor;
        this.x2Accessor = x2Accessor;
        this.y2Accessor = y2Accessor;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction) {
        const finalSelection = this.performDataJoin(
            'rect',
            transitionDuration,
            ease
        ) as any;

        if (!this.dataPoints || finalSelection.empty()) return;

        return finalSelection
            .attr('fill', this.options.fill)
            .attr('stroke', this.options.stroke)
            .attr('stroke-width', this.options.strokeWidth)
            .attr('opacity', (d: Record<string, any>) => {
                const x1 = this.x1Accessor(d);
                const y1 = this.y1Accessor(d);
                const x2 = this.x2Accessor(d);
                const y2 = this.y2Accessor(d);
                // Hide rectangles with invalid coordinates
                if (
                    x1 == null ||
                    y1 == null ||
                    x2 == null ||
                    y2 == null ||
                    isNaN(x1) ||
                    isNaN(y1) ||
                    isNaN(x2) ||
                    isNaN(y2)
                ) {
                    return 0;
                }
                return this.options.opacity;
            })
            .attr('class', this.options.className)
            .attr('x', (d: Record<string, any>) => {
                const x1Val = this.x1Accessor(d);
                const x2Val = this.x2Accessor(d);
                if (x1Val == null || x2Val == null) return 0;
                const x1 = this.convertX(x1Val);
                const x2 = this.convertX(x2Val);
                return Math.min(x1, x2);
            })
            .attr('y', (d: Record<string, any>) => {
                const y1Val = this.y1Accessor(d);
                const y2Val = this.y2Accessor(d);
                if (y1Val == null || y2Val == null) return 0;
                const y1 = this.convertY(y1Val);
                const y2 = this.convertY(y2Val);
                return Math.min(y1, y2);
            })
            .attr('width', (d: Record<string, any>) => {
                const x1Val = this.x1Accessor(d);
                const x2Val = this.x2Accessor(d);
                if (x1Val == null || x2Val == null) return 0;
                const x1 = this.convertX(x1Val);
                const x2 = this.convertX(x2Val);
                return Math.abs(x2 - x1);
            })
            .attr('height', (d: Record<string, any>) => {
                const y1Val = this.y1Accessor(d);
                const y2Val = this.y2Accessor(d);
                if (y1Val == null || y2Val == null) return 0;
                const y1 = this.convertY(y1Val);
                const y2 = this.convertY(y2Val);
                return Math.abs(y2 - y1);
            });
    }
}

export interface BatchTextPrimitiveOptions {
    xAccessor?: CoordinateAccessor;
    yAccessor?: CoordinateAccessor;
    textAccessor?: (d: Record<string, any>) => string;
    angleAccessor?: (d: Record<string, any>) => number | null | undefined;
    anchor?: string;
    baseline?: string;
    fontFamily?: string;
    fontSize?: number;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}

export class BatchTextPrimitive extends BatchPrimitive {
    xAccessor!: CoordinateAccessor;
    yAccessor!: CoordinateAccessor;
    textAccessor?: (d: Record<string, any>) => string;
    angleAccessor?: (d: Record<string, any>) => number | null | undefined;

    declare options: Required<BatchPrimitiveConfig> &
        Required<BatchTextPrimitiveOptions>;

    constructor(
        manager: PrimitiveManager,
        element: Element,
        options: Required<BatchPrimitiveConfig> &
            Required<BatchTextPrimitiveOptions>
    ) {
        super(manager, element, options);
        if (options.xAccessor) this.xAccessor = options.xAccessor;
        if (options.yAccessor) this.yAccessor = options.yAccessor;
        if (options.textAccessor) this.textAccessor = options.textAccessor;
        if (options.angleAccessor) this.angleAccessor = options.angleAccessor;
    }

    setCoordinateAccessors(
        xAccessor: CoordinateAccessor,
        yAccessor: CoordinateAccessor
    ): this {
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        return this;
    }

    setTextAccessor(textAccessor: (d: Record<string, any>) => string): this {
        this.textAccessor = textAccessor;
        return this;
    }

    setAngleAccessor(
        angleAccessor: (d: Record<string, any>) => number | null | undefined
    ): this {
        this.angleAccessor = angleAccessor;
        return this;
    }

    render(transitionDuration = 0, ease?: EasingFunction) {
        const finalSelection = this.performDataJoin(
            'text',
            transitionDuration,
            ease
        ) as any;

        if (!this.dataPoints || finalSelection.empty()) return;

        return finalSelection
            .text((d: Record<string, any>) =>
                this.textAccessor ? this.textAccessor(d) : d
            )
            .attr('x', (d: Record<string, any>) => {
                const val = this.xAccessor(d);
                return val != null ? this.convertX(val) : 0;
            })
            .attr('y', (d: Record<string, any>) => {
                const val = this.yAccessor(d);
                return val != null ? this.convertY(val) : 0;
            })
            .attr('text-anchor', this.options.anchor)
            .attr('dominant-baseline', this.options.baseline)
            .attr('font-family', this.options.fontFamily)
            .attr('font-size', this.options.fontSize)
            .attr('fill', this.options.fill)
            .attr('opacity', (d: Record<string, any>) => {
                const x = this.xAccessor(d);
                const y = this.yAccessor(d);
                // Hide text with invalid coordinates
                if (x == null || y == null || isNaN(x) || isNaN(y)) {
                    return 0;
                }
                return this.options.opacity;
            })
            .attr('class', this.options.className)
            .attr('transform', (d: Record<string, any>) => {
                const angle = this.angleAccessor ? this.angleAccessor(d) : 0;
                if (angle) {
                    const xVal = this.xAccessor(d);
                    const yVal = this.yAccessor(d);
                    if (xVal == null || yVal == null) return null;
                    const x = this.convertX(xVal);
                    const y = this.convertY(yVal);
                    return `rotate(${angle}, ${x}, ${y})`;
                }
                return null;
            });
    }
}

type SVGElementType = 'path' | 'line' | 'rect' | 'text' | 'image' | 'g';
export type PrimitiveInfo = {
    isBatch: boolean;
    svgElementType: SVGElementType;
};
type PrimitiveConstructor = new (
    manager: any,
    element: any,
    options: any
) => Primitive<any>;

export const PRIMITIVE_LOOKUP = new Map<PrimitiveConstructor, PrimitiveInfo>([
    [PointPrimitive, { isBatch: false, svgElementType: 'path' }],
    [LinePrimitive, { isBatch: false, svgElementType: 'line' }],
    [RectanglePrimitive, { isBatch: false, svgElementType: 'rect' }],
    [TextPrimitive, { isBatch: false, svgElementType: 'text' }],
    [PathPrimitive, { isBatch: false, svgElementType: 'path' }],
    [ContourPrimitive, { isBatch: false, svgElementType: 'g' }],
    [ImagePrimitive, { isBatch: false, svgElementType: 'image' }],
    [BatchPointsPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchLinesPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchRectanglesPrimitive, { isBatch: true, svgElementType: 'g' }],
    [BatchTextPrimitive, { isBatch: true, svgElementType: 'g' }],
]);
