import * as d3 from 'd3';
import BasePlot from '../base-plot';
import { Primitive, PointPrimitive, PointPrimitiveOptions, LinePrimitive, LinePrimitiveOptions, RectanglePrimitive, RectanglePrimitiveOptions, TextPrimitive, TextPrimitiveOptions, PathPrimitive, PathPrimitiveOptions, AreaPrimitive, AreaPrimitiveOptions, ContourPrimitive, ContourPrimitiveOptions, ImagePrimitive, ImagePrimitiveOptions, BatchPointsPrimitive, BatchPointsPrimitiveOptions, BatchLinesPrimitive, BatchLinesPrimitiveOptions, BatchRectanglesPrimitive, BatchRectanglesPrimitiveOptions, BatchTextPrimitive, BatchTextPrimitiveOptions } from './primitives';
import type { CoordinateAccessor } from './primitives';
import { PrimitiveConfig, BatchPrimitiveConfig } from '../config';
type Layer = d3.Selection<SVGGElement, unknown, null, undefined>;
interface LayerObject {
    layer: Layer;
    zIndex: number;
    primitiveIds: Set<string>;
}
declare class PrimitiveManager {
    BasePlot: BasePlot;
    primitives: Map<string, Primitive<any>>;
    layerObjectMap: Map<string, LayerObject>;
    defaultLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
    constructor(BasePlot: BasePlot);
    createLayer(name: string, zIndex?: number): Layer;
    getLayer(name?: string): Layer;
    sortLayers(): void;
    private addPrimitive;
    private createSvgElement;
    addPoint(x: number, y: number, options?: PointPrimitiveOptions & PrimitiveConfig): PointPrimitive;
    addLine(x1: number, y1: number, x2: number, y2: number, options?: LinePrimitiveOptions & PrimitiveConfig): LinePrimitive;
    addPath(dataPoints: Record<string, any>[], xAccessor: (d: Record<string, any>) => number | null | undefined, yAccessor: (d: Record<string, any>) => number | null | undefined, options?: PathPrimitiveOptions & PrimitiveConfig): PathPrimitive;
    addArea(dataPoints: Record<string, any>[], xAccessor: (d: Record<string, any>) => number | null | undefined, y0Accessor: (d: Record<string, any>) => number | null | undefined, y1Accessor: (d: Record<string, any>) => number | null | undefined, options?: AreaPrimitiveOptions & PrimitiveConfig): AreaPrimitive;
    addRectangle(x1: number, y1: number, x2: number, y2: number, options?: PrimitiveConfig & RectanglePrimitiveOptions): RectanglePrimitive;
    addText(textContent: string, x: number, y: number, options?: PrimitiveConfig & TextPrimitiveOptions): TextPrimitive;
    addContour(fValues: number[], xRange: number[], yRange: number[], options?: PrimitiveConfig & ContourPrimitiveOptions): ContourPrimitive;
    addImage(href: string, options?: PrimitiveConfig & ImagePrimitiveOptions): ImagePrimitive;
    addPoints(dataPoints: Record<string, any>[], xAccessor: CoordinateAccessor, yAccessor: CoordinateAccessor, options?: BatchPrimitiveConfig & BatchPointsPrimitiveOptions): BatchPointsPrimitive;
    addLines(dataPoints: Record<string, any>[], x1Accessor: CoordinateAccessor, y1Accessor: CoordinateAccessor, x2Accessor: CoordinateAccessor, y2Accessor: CoordinateAccessor, options?: BatchPrimitiveConfig & BatchLinesPrimitiveOptions): BatchLinesPrimitive;
    addRectangles(dataPoints: Record<string, any>[], x1Accessor: CoordinateAccessor, y1Accessor: CoordinateAccessor, x2Accessor: CoordinateAccessor, y2Accessor: CoordinateAccessor, options?: BatchPrimitiveConfig & BatchRectanglesPrimitiveOptions): BatchRectanglesPrimitive;
    addTexts(dataPoints: Record<string, any>[], xAccessor: CoordinateAccessor, yAccessor: CoordinateAccessor, textAccessor: (d: Record<string, any>) => string, options?: BatchPrimitiveConfig & BatchTextPrimitiveOptions): BatchTextPrimitive;
    createArrowMarker(color: string, direction: 'start' | 'end'): string;
    getPrimitive(id: string): Primitive<any> | undefined;
    removePrimitive(id: string): boolean;
    clearLayer(layerName: string): void;
    clearAll(): void;
    getPrimitivesByType<T extends new (...args: any[]) => Primitive>(primitiveClass: T): InstanceType<T>[];
    getPrimitivesByLayer(layerName: string): Primitive[];
}
export default PrimitiveManager;
