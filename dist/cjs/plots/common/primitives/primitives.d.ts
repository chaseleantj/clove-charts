import * as d3 from 'd3';
import PrimitiveManager from './primitive-manager';
import type BasePlot from '../base-plot';
import { ImmutablePrimitiveConfig, PrimitiveConfig, BatchPrimitiveConfig, DataDrivenValue } from '../config';
type Element = d3.Selection<any, any, any, any>;
type Transition = d3.Transition<any, any, any, any>;
type EasingFunction = (t: number) => number;
export type CoordinateAccessor = (d: Record<string, any>) => number | null | undefined;
export declare abstract class Primitive<TConfig extends PrimitiveConfig<any, any, any, any> = PrimitiveConfig> {
    protected readonly manager: PrimitiveManager;
    protected readonly element: Element;
    updateFunc: (() => void) | null;
    options: Required<TConfig>;
    constructor(manager: PrimitiveManager, element: Element, options: Required<TConfig>);
    setStyles(styles: Partial<Omit<TConfig, keyof ImmutablePrimitiveConfig>>): this;
    convertX(x: number): number;
    convertY(y: number): number;
    protected getElementWithTransition<GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum>(element: d3.Selection<GElement, Datum, PElement, PDatum>, transitionDuration?: number, ease?: EasingFunction): d3.Selection<GElement, Datum, PElement, PDatum> | d3.Transition<GElement, Datum, PElement, PDatum>;
    protected applyCommonStyles<T extends Element | Transition>(element: T): T;
    abstract render(transitionDuration: number, ease?: EasingFunction): Transition;
    abstract render(transitionDuration?: 0): Element;
    createUpdateFunction(updateCallback: (this: BasePlot) => void): this;
    update(): void;
    remove(): void;
    show(): this;
    hide(): this;
    attachEvent<K extends keyof SVGElementEventMap>(event: K, handler: (event: SVGElementEventMap[K]) => void): this;
}
export interface PointPrimitiveOptions {
    size?: number;
    symbolType?: d3.SymbolType;
}
export declare class PointPrimitive extends Primitive<PrimitiveConfig & PointPrimitiveOptions> {
    x?: number;
    y?: number;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<PointPrimitiveOptions>);
    setCoords(x: number, y: number): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface LinePrimitiveOptions {
    arrow?: 'start' | 'end' | 'both' | 'none';
    strokeDashArray?: string;
    strokeDashOffset?: number;
}
export declare class LinePrimitive extends Primitive<PrimitiveConfig & LinePrimitiveOptions> {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<LinePrimitiveOptions>);
    setCoords(x1: number, y1: number, x2: number, y2: number): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface RectanglePrimitiveOptions {
}
export declare class RectanglePrimitive extends Primitive<PrimitiveConfig & RectanglePrimitiveOptions> {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<RectanglePrimitiveOptions>);
    setCoords(x1: number, y1: number, x2: number, y2: number): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface TextPrimitiveOptions {
    fontSize?: number;
    fontFamily?: string | null;
    anchor?: 'start' | 'middle' | 'end';
    baseline?: 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top';
    angle?: number;
    latex?: boolean;
}
export declare class TextPrimitive extends Primitive<PrimitiveConfig & TextPrimitiveOptions> {
    x?: number;
    y?: number;
    angle: number;
    text: string;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<TextPrimitiveOptions>);
    setText(text: string): this;
    setAngle(angle: number): this;
    setCoords(x: number, y: number): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
    private renderPlainText;
    private renderMath;
}
export interface PathPrimitiveOptions {
    strokeDashArray?: string;
    strokeDashOffset?: number;
    curve?: d3.CurveFactory | d3.CurveFactoryLineOnly;
}
export declare class PathPrimitive extends Primitive<PrimitiveConfig & PathPrimitiveOptions> {
    dataPoints: Record<string, any>[];
    xAccessor: CoordinateAccessor;
    yAccessor: CoordinateAccessor;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<PathPrimitiveOptions>);
    setData(dataPoints: Record<string, any>[]): this;
    setCoordinateAccessors(xAccessor: CoordinateAccessor, yAccessor: CoordinateAccessor): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface AreaPrimitiveOptions {
    curve?: d3.CurveFactory;
}
export declare class AreaPrimitive extends Primitive<PrimitiveConfig & AreaPrimitiveOptions> {
    dataPoints: Record<string, any>[];
    xAccessor: CoordinateAccessor;
    y0Accessor: CoordinateAccessor;
    y1Accessor: CoordinateAccessor;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<AreaPrimitiveOptions>);
    setData(dataPoints: Record<string, any>[]): this;
    setCoordinateAccessors(xAccessor: CoordinateAccessor, y0Accessor: CoordinateAccessor, y1Accessor: CoordinateAccessor): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface ContourPrimitiveOptions {
    thresholds?: number | number[];
    colorScale?: d3.ScaleSequential<string, never> | ((t: number) => string);
}
export declare class ContourPrimitive extends Primitive<PrimitiveConfig & ContourPrimitiveOptions> {
    fValues: number[];
    xRange: number[];
    yRange: number[];
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<ContourPrimitiveOptions>);
    private calculateContours;
    private createPathGenerator;
    setData(fValues: number[], xRange: number[], yRange: number[]): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface ImagePrimitiveOptions {
    width?: number | null;
    coords?: [number, number] | null;
    useCornerCoords?: boolean;
    preserveAspectRatio?: string;
}
export declare class ImagePrimitive extends Primitive<PrimitiveConfig & ImagePrimitiveOptions> {
    width: number | null;
    coords: [number, number] | null;
    useCornerCoords: boolean;
    preserveAspectRatio: string;
    href: string;
    naturalWidth: number;
    naturalHeight: number;
    aspectRatio: number;
    isLoading: boolean;
    isLoaded: boolean;
    loadPromise: Promise<unknown>;
    constructor(manager: PrimitiveManager, element: Element, options: Required<PrimitiveConfig> & Required<ImagePrimitiveOptions>);
    setSource(href: string): this;
    setCoords(coords: [number, number]): this;
    setWidth(width: number): this;
    loadImage(href: string): Promise<unknown>;
    private calculateDimensions;
    private calculatePosition;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
    isReady(): boolean;
    whenReady(): Promise<unknown>;
}
export declare abstract class BatchPrimitive<TConfig extends BatchPrimitiveConfig = BatchPrimitiveConfig> extends Primitive<TConfig> {
    dataPoints: Record<string, any>[];
    xAccessor: CoordinateAccessor;
    yAccessor: CoordinateAccessor;
    keyAccessor: (d: Record<string, any>, i: number) => number;
    elementSelection: d3.Selection<SVGPathElement | SVGLineElement | SVGRectElement | SVGTextElement | SVGImageElement | SVGGElement, Record<string, any>, d3.BaseType, unknown> | d3.Selection<null, unknown, null, undefined>;
    constructor(manager: PrimitiveManager, element: Element, options: Required<TConfig>);
    setData(dataPoints: Record<string, any>[], keyAccessor?: (d: Record<string, any>, i: number) => number): this;
    protected applyCommonStyles<T extends Element | Transition>(element: T): T;
    protected performDataJoin(elementType: SVGElementType, transitionDuration?: number, ease?: EasingFunction): d3.Selection<SVGPathElement | SVGLineElement | SVGRectElement | SVGTextElement | SVGImageElement | SVGGElement, Record<string, any>, d3.BaseType, unknown> | d3.Transition<SVGPathElement | SVGLineElement | SVGRectElement | SVGTextElement | SVGImageElement | SVGGElement, Record<string, any>, d3.BaseType, unknown> | d3.Selection<null, unknown, null, undefined>;
    abstract render(transitionDuration: number, ease?: EasingFunction): Transition;
    abstract render(transitionDuration?: 0): Element;
    remove(): void;
    attachEvent<K extends keyof SVGElementEventMap>(event: K, handler: (event: SVGElementEventMap[K], d: Record<string, any>) => void): this;
}
export interface BatchPointsPrimitiveOptions {
    size?: DataDrivenValue<number>;
    symbolType?: DataDrivenValue<d3.SymbolType>;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}
export declare class BatchPointsPrimitive extends BatchPrimitive<BatchPrimitiveConfig & BatchPointsPrimitiveOptions> {
    xAccessor: CoordinateAccessor;
    yAccessor: CoordinateAccessor;
    constructor(manager: PrimitiveManager, element: Element, options: Required<BatchPrimitiveConfig> & Required<BatchPointsPrimitiveOptions>);
    setCoordinateAccessors(xAccessor: CoordinateAccessor, yAccessor: CoordinateAccessor): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
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
export declare class BatchLinesPrimitive extends BatchPrimitive<BatchPrimitiveConfig & BatchLinesPrimitiveOptions> {
    x1Accessor: CoordinateAccessor;
    y1Accessor: CoordinateAccessor;
    x2Accessor: CoordinateAccessor;
    y2Accessor: CoordinateAccessor;
    constructor(manager: PrimitiveManager, element: Element, options: Required<BatchPrimitiveConfig> & Required<BatchLinesPrimitiveOptions>);
    setCoordinateAccessors(x1Accessor: CoordinateAccessor, y1Accessor: CoordinateAccessor, x2Accessor: CoordinateAccessor, y2Accessor: CoordinateAccessor): BatchLinesPrimitive;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
export interface BatchRectanglesPrimitiveOptions {
    x1Accessor?: CoordinateAccessor;
    y1Accessor?: CoordinateAccessor;
    x2Accessor?: CoordinateAccessor;
    y2Accessor?: CoordinateAccessor;
    keyAccessor?: (d: Record<string, any>, i: number) => number;
}
export declare class BatchRectanglesPrimitive extends BatchPrimitive<BatchPrimitiveConfig & BatchRectanglesPrimitiveOptions> {
    x1Accessor: CoordinateAccessor;
    y1Accessor: CoordinateAccessor;
    x2Accessor: CoordinateAccessor;
    y2Accessor: CoordinateAccessor;
    constructor(manager: PrimitiveManager, element: Element, options: Required<BatchPrimitiveConfig> & Required<BatchRectanglesPrimitiveOptions>);
    setCoordinateAccessors(x1Accessor: CoordinateAccessor, y1Accessor: CoordinateAccessor, x2Accessor: CoordinateAccessor, y2Accessor: CoordinateAccessor): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
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
export declare class BatchTextPrimitive extends BatchPrimitive<BatchPrimitiveConfig & BatchTextPrimitiveOptions> {
    xAccessor: CoordinateAccessor;
    yAccessor: CoordinateAccessor;
    textAccessor?: (d: Record<string, any>) => string;
    angleAccessor?: (d: Record<string, any>) => number | null | undefined;
    constructor(manager: PrimitiveManager, element: Element, options: Required<BatchPrimitiveConfig> & Required<BatchTextPrimitiveOptions>);
    setCoordinateAccessors(xAccessor: CoordinateAccessor, yAccessor: CoordinateAccessor): this;
    setTextAccessor(textAccessor: (d: Record<string, any>) => string): this;
    setAngleAccessor(angleAccessor: (d: Record<string, any>) => number | null | undefined): this;
    render(transitionDuration: number, ease?: EasingFunction): Transition;
    render(transitionDuration?: 0): Element;
}
type SVGElementType = 'path' | 'line' | 'rect' | 'text' | 'image' | 'g';
export type PrimitiveInfo = {
    isBatch: boolean;
    svgElementType: SVGElementType;
};
type PrimitiveConstructor = new (manager: any, element: any, options: any) => Primitive<any>;
export declare const PrimitiveInfoMap: Map<PrimitiveConstructor, PrimitiveInfo>;
export {};
