import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';
import PrimitiveFactory, { PRIMITIVE_LOOKUP } from './primitives';
import { DEFAULT_PRIMITIVE_CONFIG } from './config';

class PrimitiveManager {
    constructor(plotInstance) {
        this.BasePlot = plotInstance;
        this.primitives = new Map();
        this.layers = new Map();
        this.defaultLayer = this.createLayer(
            DEFAULT_PRIMITIVE_CONFIG.layerName
        );
    }

    createLayer(name, zIndex = 0) {
        const layer = this.BasePlot.plot
            .append('g')
            .attr('class', `layer-${name}`)
            .attr('data-z-index', zIndex);

        this.layers.set(name, {
            element: layer,
            zIndex,
            primitives: new Set(),
        });
        this.sortLayers();

        return layer;
    }

    getLayer(name = DEFAULT_PRIMITIVE_CONFIG.layerName) {
        return this.layers.has(name)
            ? this.layers.get(name).element
            : this.createLayer(name, 0);
    }

    sortLayers() {
        const layersArray = Array.from(this.layers.values()).sort(
            (a, b) => a.zIndex - b.zIndex
        );

        layersArray.forEach((layer) => {
            layer.element.raise();
        });
    }

    addPrimitive(type, config) {
        // Merge default config with provided config, giving priority to provided values
        const options = {
            className: `primitive-${type}`,
            ...DEFAULT_PRIMITIVE_CONFIG,
            ...config,
        };

        const layer = this.getLayer(options.layerName);
        const element = this.createSvgElement(type, layer, options);
        const primitive = PrimitiveFactory.create(type, this, element, options);

        const id = options.dataId || `${type}-${uuidv4()}`;
        this.primitives.set(id, primitive);
        this.layers.get(options.layerName).primitives.add(id);

        return primitive;
    }

    createSvgElement(type, layer, options) {
        const primitiveInfo = PRIMITIVE_LOOKUP.get(type);
        const isBatch = primitiveInfo.isBatch;
        const className = isBatch
            ? options.className + '-group'
            : options.className;

        // Use <foreignObject> when rendering KaTeX so that HTML can live inside SVG
        const elementType =
            type === 'text' && options.latex
                ? 'foreignObject'
                : primitiveInfo.htmlElementType;
        const element = layer.append(elementType);

        element
            .attr('class', className)
            .attr('pointer-events', options.pointerEvents);

        // TODO: Make distinction between individual and batch primitives, and assign the data-id as an accessor for batch primitives
        if (options.hasOwnProperty('dataId')) {
            element.attr('data-id', options.dataId);
        }

        return element;
    }

    addPoint(x, y, options = {}) {
        options = {
            size: 64,
            fill: DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
            symbolType: d3.symbolCircle,
            ...options,
        };

        const point = this.addPrimitive('point', options);

        point.setCoords(x, y).render();

        if (point.options.coordinateSystem === 'data') {
            point.createUpdateFunction(function () {
                point
                    .setCoords(point.x, point.y)
                    .render(this.themeConfig.transitionDuration);
            });
        }

        return point;
    }

    addLine(x1, y1, x2, y2, options = {}) {
        options = {
            stroke: DEFAULT_PRIMITIVE_CONFIG.stroke,
            strokeWidth: 1.5,
            arrow: 'none',
            ...options,
        };

        const line = this.addPrimitive('line', options);

        line.setCoords(x1, y1, x2, y2).render();

        if (line.options.coordinateSystem === 'data') {
            line.createUpdateFunction(function () {
                line.setCoords(line.x1, line.y1, line.x2, line.y2).render(
                    this.themeConfig.transitionDuration
                );
            });
        }

        return line;
    }

    addPath(dataPoints, xAccessor, yAccessor, options = {}) {
        options = {
            stroke: DEFAULT_PRIMITIVE_CONFIG.stroke,
            strokeWidth: 1.5,
            fill: 'none',
            curve: d3.curveLinear,
            ...options,
        };

        const path = this.addPrimitive('path', options);

        path.setData(dataPoints)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();

        if (path.options.coordinateSystem === 'data') {
            path.createUpdateFunction(function () {
                path.setData(dataPoints)
                    .setCoordinateAccessors(xAccessor, yAccessor)
                    .render(this.themeConfig.transitionDuration);
            });
        }

        return path;
    }

    addRectangle(x1, y1, x2, y2, options = {}) {
        options = {
            fill: DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
        };

        const rect = this.addPrimitive('rect', options);

        rect.setCoords(x1, y1, x2, y2).render();

        if (rect.options.coordinateSystem === 'data') {
            rect.createUpdateFunction(function () {
                rect.setCoords(rect.x1, rect.y1, rect.x2, rect.y2).render(
                    this.themeConfig.transitionDuration
                );
            });
        }

        return rect;
    }

    addText(textContent, x, y, options = {}) {
        options = {
            fontSize: 12,
            fontFamily: null,
            fill: 'currentColor',
            anchor: 'middle',
            baseline: 'middle',
            angle: 0,
            latex: false,
            ...options,
        };

        const text = this.addPrimitive('text', options);

        text.setText(textContent)
            .setCoords(x, y)
            .setAngle(options.angle)
            .render();

        if (text.options.coordinateSystem === 'data') {
            text.createUpdateFunction(function () {
                text.setCoords(text.x, text.y)
                    .setAngle(text.angle)
                    .render(this.themeConfig.transitionDuration);
            });
        }

        return text;
    }

    addContour(fValues, xRange, yRange, options = {}) {
        options = {
            thresholds: 10,
            stroke: 'currentColor',
            strokeWidth: 1,
            className: 'primitive-contours',
            colorScale: d3.interpolateRdBu,
            opacity: 1,
            ...options,
        };

        const contour = this.addPrimitive('contour', options);

        contour.setData(fValues, xRange, yRange).render();

        if (contour.options.coordinateSystem === 'data') {
            contour.createUpdateFunction(function () {
                contour
                    .setData(contour.fValues, contour.xRange, contour.yRange)
                    .render(this.themeConfig.transitionDuration);
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

        const image = this.addPrimitive('image', options);

        // image.element.attr('preserveAspectRatio', image.preserveAspectRatio);

        image
            .loadImage(href)
            .then(() => {
                if (image.options.coordinateSystem === 'data') {
                    image.createUpdateFunction(function () {
                        image.render(this.themeConfig.transitionDuration);
                    });
                }
            })
            .catch((error) => {
                console.error('Image loading failed:', error);
            });

        return image;
    }

    addPoints(dataArray, xAccessor, yAccessor, options = {}) {
        options = {
            className: 'primitive-batch-points',
            size: 64,
            fill: DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
            symbolType: d3.symbolCircle,
            keyAccessor: (d, i) => i,
            ...options,
        };

        const points = this.addPrimitive('batch-points', options);

        points
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();

        if (points.options.coordinateSystem === 'data') {
            points.createUpdateFunction(function () {
                points.render(this.themeConfig.transitionDuration);
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
            stroke: DEFAULT_PRIMITIVE_CONFIG.stroke,
            strokeWidth: 1.5,
            keyAccessor: (d, i) => i,
            arrow: 'none',
            ...options,
        };

        const lines = this.addPrimitive('batch-lines', options);

        lines
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(
                x1Accessor,
                y1Accessor,
                x2Accessor,
                y2Accessor
            )
            .render();

        if (lines.options.coordinateSystem === 'data') {
            lines.createUpdateFunction(function () {
                lines.render(this.themeConfig.transitionDuration);
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

        const rectangles = this.addPrimitive('batch-rectangles', options);

        rectangles
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(
                x1Accessor,
                y1Accessor,
                x2Accessor,
                y2Accessor
            )
            .render();

        if (rectangles.options.coordinateSystem === 'data') {
            rectangles.createUpdateFunction(function () {
                rectangles.render(this.themeConfig.transitionDuration);
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

        const texts = this.addPrimitive('batch-text', options);

        texts
            .setData(dataArray, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .setTextAccessor(textAccessor);

        if (options.angleAccessor) {
            texts.setAngleAccessor(options.angleAccessor);
        }

        texts.render();

        if (texts.options.coordinateSystem === 'data') {
            texts.createUpdateFunction(function () {
                texts.render(this.themeConfig.transitionDuration);
            });
        }

        return texts;
    }

    // Create arrowheads of different color
    createArrowMarker(color, direction) {
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

    getPrimitive(id) {
        return this.primitives.get(id);
    }

    removePrimitive(id) {
        const primitive = this.getPrimitive(id);
        if (primitive) {
            primitive.remove();
            this.primitives.delete(id);

            // Remove from layer tracking
            this.layers.forEach((layer) => {
                layer.primitives.delete(id);
            });
        }
    }

    clearLayer(layerName) {
        if (this.layers.has(layerName)) {
            const layer = this.layers.get(layerName);

            // Remove all primitives in this layer
            layer.primitives.forEach((id) => {
                const primitive = this.primitives.get(id);
                if (primitive) {
                    primitive.remove();
                    this.primitives.delete(id);
                }
            });

            // Clear the layer
            layer.element.selectAll('*').remove();
            layer.primitives.clear();
        }
    }

    clearAll() {
        // Remove all primitives
        this.primitives.forEach((primitive) => {
            primitive.remove();
        });

        // Clear all layers
        this.layers.forEach((layer) => {
            layer.element.selectAll('*').remove();
            layer.primitives.clear();
        });

        // Clear primitive map
        this.primitives.clear();
    }

    getPrimitivesByType(type) {
        return Array.from(this.primitives.values()).filter(
            (p) => p.type === type
        );
    }

    getPrimitivesByLayer(layerName) {
        const layer = this.layers.get(layerName);
        if (!layer) return [];

        return Array.from(layer.primitives)
            .map((id) => this.primitives.get(id))
            .filter(Boolean);
    }
}

export default PrimitiveManager;
