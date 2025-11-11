import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';
import BasePlot from '@/components/plots/common/base';
import {
    Primitive,
    PointPrimitive,
    PointPrimitiveOptions,
    LinePrimitive,
    LinePrimitiveOptions,
    RectanglePrimitive,
    RectanglePrimitiveOptions,
    TextPrimitive,
    TextPrimitiveOptions,
    PathPrimitive,
    PathPrimitiveOptions,
    ContourPrimitive,
    ContourPrimitiveOptions,
    ImagePrimitive,
    BatchPointsPrimitive,
    BatchLinesPrimitive,
    BatchRectanglesPrimitive,
    BatchTextPrimitive,
    PrimitiveInfo,
    PRIMITIVE_LOOKUP,
} from '@/components/plots/common/primitives/primitives';
import { DEFAULT_PRIMITIVE_CONFIG, PrimitiveConfig } from '@/components/plots/common/config';
import { CoordinateSystem } from '@/components/plots/common/types';

type Layer = d3.Selection<SVGGElement, unknown, null, undefined>;

interface LayerObject {
    layer: Layer,
    zIndex: number,
    primitiveIds: Set<string> // just stores the primitive ids
}

class PrimitiveManager {

    primitives: Map<string, Primitive>;
    layerObjectMap: Map<string, LayerObject>;
    defaultLayer: d3.Selection<SVGGElement, unknown, null, undefined>;

    constructor(public BasePlot: BasePlot) {
        this.primitives = new Map();
        this.layerObjectMap = new Map();
        this.defaultLayer = this.createLayer(
            DEFAULT_PRIMITIVE_CONFIG.layerName
        );
    }

    public createLayer(name: string, zIndex = 0): Layer {
        const layer = this.BasePlot.plot
            .append('g')
            .attr('class', `layer-${name}`)
            .attr('data-z-index', zIndex);

        this.layerObjectMap.set(name, {
            layer,
            zIndex,
            primitiveIds: new Set(),
        });
        this.sortLayers();

        return layer;
    }

    public getLayer(name = DEFAULT_PRIMITIVE_CONFIG.layerName): Layer {
        return this.layerObjectMap.has(name)
            ? this.layerObjectMap.get(name)!.layer
            : this.createLayer(name, 0);
    }

    public sortLayers(): void {
        const layersArray = Array.from(this.layerObjectMap.values()).sort(
            (a, b) => a.zIndex - b.zIndex
        );

        layersArray.forEach((layer) => {
            layer.layer.raise();
        });
    }

    private addPrimitive<T extends new (...args: any[]) => Primitive>(
        primitiveClass: T,
        config: any
    ): InstanceType<T> {
        const primitiveInfo = PRIMITIVE_LOOKUP.get(primitiveClass);
        if (!primitiveInfo) {
            throw new Error(`Unknown primitive class: ${primitiveClass.name}`);
        }

        const options = {
            ...DEFAULT_PRIMITIVE_CONFIG,
            className: `primitive-${primitiveClass.name.replace('Primitive', '').toLowerCase()}`,
            ...config,
        };

        const layer = this.getLayer(options.layerName);
        const element = this.createSvgElement(primitiveClass, layer, options, primitiveInfo);
        const primitive = new primitiveClass(this, element, options);

        const id = options.dataId || `${primitiveClass.name}-${uuidv4()}`;
        this.primitives.set(id, primitive);
        this.layerObjectMap.get(options.layerName)!.primitiveIds.add(id);

        return primitive as InstanceType<T>;
    }

    private createSvgElement<T extends new (...args: any[]) => Primitive>(
        primitiveClass: T, 
        layer: Layer, 
        options: any,
        primitiveInfo: PrimitiveInfo
    ): d3.Selection<d3.BaseType, unknown, null, undefined> {
        const isBatch = primitiveInfo.isBatch;
        const className = isBatch
            ? options.className + '-group'
            : options.className;

        const elementType =
            primitiveClass instanceof TextPrimitive && options.latex
                ? 'foreignObject'
                : primitiveInfo.htmlElementType;
        const element = layer.append(elementType);

        element
            .attr('class', className)
            .attr('pointer-events', options.pointerEvents);

        if (options.hasOwnProperty('dataId')) {
            element.attr('data-id', options.dataId);
        }

        return element;
    }

    addPoint(x: number, y: number, options: PointPrimitiveOptions & PrimitiveConfig = {}): PointPrimitive {
        options = {
            size: 64,
            stroke: 'none',
            symbolType: d3.symbolCircle,
            ...options,
        };

        const point = this.addPrimitive(PointPrimitive, options);

        point.setCoords(x, y).render();

        if (point.options.coordinateSystem === CoordinateSystem.Data) {
            point.createUpdateFunction(function () {
                point
                    .setCoords(point.x!, point.y!)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }

        return point;
    }

    addLine(x1: number, y1: number, x2: number, y2: number, options: LinePrimitiveOptions & PrimitiveConfig = {}) {
        options = {
            strokeWidth: 1.5,
            arrow: 'none',
            ...options,
        };

        const line = this.addPrimitive(LinePrimitive, options);

        line.setCoords(x1, y1, x2, y2).render();

        if (line.options.coordinateSystem === CoordinateSystem.Data) {
            line.createUpdateFunction(function () {
                line.setCoords(line.x1!, line.y1!, line.x2!, line.y2!).render(
                    this.config.themeConfig.transitionDuration
                );
            });
        }

        return line;
    }

    addPath(
        dataPoints: Record<string, any>[],
        xAccessor: (d: Record<string, any>) => number | null | undefined,
        yAccessor: (d: Record<string, any>) => number | null | undefined,
        options: PathPrimitiveOptions & PrimitiveConfig = {}
    ) {
        options = {
            strokeWidth: 1.5,
            fill: 'none',
            curve: d3.curveLinear,
            ...options,
        };

        const path = this.addPrimitive(PathPrimitive, options);

        path.setData(dataPoints)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();

        if (path.options.coordinateSystem === CoordinateSystem.Data) {
            path.createUpdateFunction(function () {
                path.setData(dataPoints)
                    .setCoordinateAccessors(xAccessor, yAccessor)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }

        return path;
    }

    addRectangle(x1: number, y1: number, x2: number, y2: number, options: PrimitiveConfig & RectanglePrimitiveOptions = {}) {
        options = {};

        const rect = this.addPrimitive(RectanglePrimitive, options);

        rect.setCoords(x1, y1, x2, y2).render();

        if (rect.options.coordinateSystem === CoordinateSystem.Data) {
            rect.createUpdateFunction(function () {
                rect.setCoords(rect.x1!, rect.y1!, rect.x2!, rect.y2!).render(
                    this.config.themeConfig.transitionDuration
                );
            });
        }

        return rect;
    }

    addText(textContent: string, x: number, y: number, options: PrimitiveConfig & TextPrimitiveOptions = {}) {
        options = {
            fontSize: 12,
            fontFamily: null,
            anchor: 'middle',
            baseline: 'middle',
            angle: 0,
            latex: false,
            ...options,
        };

        const text = this.addPrimitive(TextPrimitive, options);

        text.setText(textContent)
            .setCoords(x, y)
            .setAngle(options.angle!)
            .render();

        if (text.options.coordinateSystem === CoordinateSystem.Data) {
            text.createUpdateFunction(function () {
                text.setCoords(text.x!, text.y!)
                    .setAngle(text.angle)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }

        return text;
    }

    addContour(
        fValues: number[], 
        xRange: number[], 
        yRange: number[], 
        options: PrimitiveConfig & ContourPrimitiveOptions = {}
    ) {
        options = {
            thresholds: 10,
            // className: 'primitive-contours',
            colorScale: d3.interpolateRdBu,
            ...options,
        };

        const contour = this.addPrimitive(ContourPrimitive, options);

        contour.setData(fValues, xRange, yRange).render();

        if (contour.options.coordinateSystem === CoordinateSystem.Data) {
            contour.createUpdateFunction(function () {
                contour
                    .setData(contour.fValues, contour.xRange, contour.yRange)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }

        return contour;
    }

    addImage(href, options = {}) {
        options = {
            coords: null,
            width: null,
            useCornerCoords: false,
            ...options,
        };

        const image = this.addPrimitive(ImagePrimitive, options);

        // image.element.attr('preserveAspectRatio', image.preserveAspectRatio);

        image
            .loadImage(href)
            .then(() => {
                if (image.options.coordinateSystem === CoordinateSystem.Data) {
                    image.createUpdateFunction(function () {
                        image.render(this.config.themeConfig.transitionDuration);
                    });
                }
            })
            .catch((error: unknown) => {
                console.error('Image loading failed:', error);
            });

        return image;
    }

    addPoints(dataArray, xAccessor, yAccessor, options = {}) {
        options = {
            className: 'primitive-batch-points',
            size: 64,
            // fill: DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
            symbolType: d3.symbolCircle,
            keyAccessor: (d, i) => i,
            ...options,
        };

        const points = this.addPrimitive(BatchPointsPrimitive, options);

        points
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();

        if (points.options.coordinateSystem === CoordinateSystem.Data) {
            points.createUpdateFunction(function () {
                points.render(this.config.themeConfig.transitionDuration);
            });
        }

        return points;
    }

    addLines(
        dataArray,
        x1Accessor,
        y1Accessor,
        x2Accessor,
        y2Accessor,
        options = {}
    ) {
        options = {
            className: 'primitive-batch-lines',
            // stroke: DEFAULT_PRIMITIVE_CONFIG.stroke,
            strokeWidth: 1.5,
            keyAccessor: (d, i) => i,
            arrow: 'none',
            ...options,
        };

        const lines = this.addPrimitive(BatchLinesPrimitive, options);

        lines
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(
                x1Accessor,
                y1Accessor,
                x2Accessor,
                y2Accessor
            )
            .render();

        if (lines.options.coordinateSystem === CoordinateSystem.Data) {
            lines.createUpdateFunction(function () {
                lines.render(this.config.themeConfig.transitionDuration);
            });
        }

        return lines;
    }

    addRectangles(
        dataArray,
        x1Accessor,
        y1Accessor,
        x2Accessor,
        y2Accessor,
        options = {}
    ) {
        options = {
            className: 'primitive-batch-rectangles',
            fill: DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
            keyAccessor: (d, i) => i,
            ...options,
        };

        const rectangles = this.addPrimitive(BatchRectanglesPrimitive, options);

        rectangles
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(
                x1Accessor,
                y1Accessor,
                x2Accessor,
                y2Accessor
            )
            .render();

        if (rectangles.options.coordinateSystem === CoordinateSystem.Data) {
            rectangles.createUpdateFunction(function () {
                rectangles.render(this.config.themeConfig.transitionDuration);
            });
        }

        return rectangles;
    }

    addTexts(dataArray, xAccessor, yAccessor, textAccessor, options = {}) {
        options = {
            className: 'primitive-batch-text',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fill: 'currentColor',
            anchor: 'middle',
            baseline: 'middle',
            angleAccessor: null,
            keyAccessor: (d, i) => i,
            ...options,
        };

        const texts = this.addPrimitive(BatchTextPrimitive, options);

        texts
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .setTextAccessor(textAccessor);

        if (options.angleAccessor) {
            texts.setAngleAccessor(options.angleAccessor);
        }

        texts.render();

        if (texts.options.coordinateSystem === CoordinateSystem.Data) {
            texts.createUpdateFunction(function () {
                texts.render(this.config.themeConfig.transitionDuration);
            });
        }

        return texts;
    }

    // Create arrowheads of different color
    createArrowMarker(color: string, direction: 'start' | 'end'): string {
        const defs = this.BasePlot.svg.select('defs');
        const markerId = `arrow-${direction}-${color.replace('#', '')}`;

        // Check if marker already exists
        if (!defs.select(`#${markerId}`).empty()) {
            return markerId;
        }

        const isStart = direction === 'start';

        defs.append('marker')
            .attr('id', markerId)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', isStart ? 0 : 10)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', isStart ? 'M 10,-5 L 0,0 L 10,5' : 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', color);

        return markerId;
    }

    getPrimitive(id: string): Primitive | undefined {
        return this.primitives.get(id);
    }

    removePrimitive(id: string): boolean {
        const primitive = this.getPrimitive(id);
        if (primitive) {
            primitive.remove();
            this.primitives.delete(id);

            // Remove from layer tracking
            this.layerObjectMap.forEach((layer) => {
                layer.primitiveIds.delete(id);
            });
            return true;
        }
        return false;
    }

    clearLayer(layerName: string): void {
        if (this.layerObjectMap.has(layerName)) {
            const layerObject = this.layerObjectMap.get(layerName);

            // Remove all primitives in this layer
            layerObject!.primitiveIds.forEach((id) => {
                const primitive = this.primitives.get(id);
                if (primitive) {
                    primitive.remove();
                    this.primitives.delete(id);
                }
            });

            // Clear the layer
            layerObject!.layer.selectAll('*').remove();
            layerObject!.primitiveIds.clear();
        }
    }

    clearAll(): void {
        this.primitives.forEach((primitive) => {
            primitive.remove();
        });

        this.layerObjectMap.forEach((layer) => {
            layer!.layer.selectAll('*').remove();
            layer!.primitiveIds.clear();
        });

        this.primitives.clear();
    }

    getPrimitivesByType<T extends new (...args: any[]) => Primitive>(primitiveClass: T): InstanceType<T>[] {
        return Array.from(this.primitives.values()).filter(
            (p) => p instanceof primitiveClass
        ) as InstanceType<T>[];
    }

    getPrimitivesByLayer(layerName: string): Primitive[] {
        const layer = this.layerObjectMap.get(layerName);
        if (!layer) return [];

        return Array.from(layer.primitiveIds)
            .map((id) => this.primitives.get(id))
            .filter(Boolean) as Primitive[];
    }
}

export default PrimitiveManager;
