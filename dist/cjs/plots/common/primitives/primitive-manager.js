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
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __importStar(require("d3"));
const uuid_1 = require("uuid");
const primitives_1 = require("./primitives");
const config_1 = require("../config");
class PrimitiveManager {
    constructor(BasePlot) {
        this.BasePlot = BasePlot;
        this.primitives = new Map();
        this.layerObjectMap = new Map();
        this.defaultLayer = this.createLayer(config_1.DEFAULT_PRIMITIVE_CONFIG.layerName);
    }
    createLayer(name, zIndex = 0) {
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
    getLayer(name = config_1.DEFAULT_PRIMITIVE_CONFIG.layerName) {
        return this.layerObjectMap.has(name)
            ? this.layerObjectMap.get(name).layer
            : this.createLayer(name, 0);
    }
    sortLayers() {
        const layersArray = Array.from(this.layerObjectMap.values()).sort((a, b) => a.zIndex - b.zIndex);
        layersArray.forEach((layer) => {
            layer.layer.raise();
        });
    }
    addPrimitive(primitiveClass, config) {
        const primitiveInfo = primitives_1.PrimitiveInfoMap.get(primitiveClass);
        if (!primitiveInfo) {
            throw new Error(`Unknown primitive class: ${primitiveClass.name}`);
        }
        const options = {
            ...config_1.DEFAULT_PRIMITIVE_CONFIG,
            className: `primitive-${primitiveClass.name.replace('Primitive', '').toLowerCase()}`,
            ...config,
        };
        const layer = this.getLayer(options.layerName);
        const element = this.createSvgElement(primitiveClass, layer, options, primitiveInfo);
        const primitive = new primitiveClass(this, element, options);
        const id = options.dataId || `${primitiveClass.name}-${(0, uuid_1.v4)()}`;
        this.primitives.set(id, primitive);
        this.layerObjectMap.get(options.layerName).primitiveIds.add(id);
        return primitive;
    }
    createSvgElement(primitiveClass, layer, options, primitiveInfo) {
        const isBatch = primitiveInfo.isBatch;
        const className = isBatch
            ? options.className + '-group'
            : options.className;
        const elementType = primitiveClass === primitives_1.TextPrimitive && options.latex
            ? 'foreignObject'
            : primitiveInfo.svgElementType;
        const element = layer.append(elementType);
        element
            .attr('class', className)
            .attr('pointer-events', options.pointerEvents);
        if (options.hasOwnProperty('dataId')) {
            element.attr('data-id', options.dataId);
        }
        return element;
    }
    addPoint(x, y, options = {}) {
        options = {
            size: 64,
            stroke: 'none',
            symbolType: d3.symbolCircle,
            ...options,
        };
        const point = this.addPrimitive(primitives_1.PointPrimitive, options);
        point.setCoords(x, y).render();
        if (point.options.coordinateSystem === 'data') {
            point.createUpdateFunction(function () {
                point
                    .setCoords(point.x, point.y)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }
        return point;
    }
    addLine(x1, y1, x2, y2, options = {}) {
        options = {
            strokeWidth: 1.5,
            arrow: 'none',
            ...options,
        };
        const line = this.addPrimitive(primitives_1.LinePrimitive, options);
        line.setCoords(x1, y1, x2, y2).render();
        if (line.options.coordinateSystem === 'data') {
            line.createUpdateFunction(function () {
                line.setCoords(line.x1, line.y1, line.x2, line.y2).render(this.config.themeConfig.transitionDuration);
            });
        }
        return line;
    }
    addPath(dataPoints, xAccessor, yAccessor, options = {}) {
        options = {
            strokeWidth: 1.5,
            fill: 'none',
            curve: d3.curveLinear,
            ...options,
        };
        const path = this.addPrimitive(primitives_1.PathPrimitive, options);
        path.setData(dataPoints)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();
        if (path.options.coordinateSystem === 'data') {
            path.createUpdateFunction(function () {
                path.setData(dataPoints)
                    .setCoordinateAccessors(xAccessor, yAccessor)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }
        return path;
    }
    addArea(dataPoints, xAccessor, y0Accessor, y1Accessor, options = {}) {
        options = {
            fill: config_1.DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            opacity: 0.5,
            curve: d3.curveLinear,
            ...options,
        };
        const area = this.addPrimitive(primitives_1.AreaPrimitive, options);
        area.setData(dataPoints)
            .setCoordinateAccessors(xAccessor, y0Accessor, y1Accessor)
            .render();
        if (area.options.coordinateSystem === 'data') {
            area.createUpdateFunction(function () {
                area.setData(dataPoints)
                    .setCoordinateAccessors(xAccessor, y0Accessor, y1Accessor)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }
        return area;
    }
    addRectangle(x1, y1, x2, y2, options = {}) {
        options = {};
        const rect = this.addPrimitive(primitives_1.RectanglePrimitive, options);
        rect.setCoords(x1, y1, x2, y2).render();
        if (rect.options.coordinateSystem === 'data') {
            rect.createUpdateFunction(function () {
                rect.setCoords(rect.x1, rect.y1, rect.x2, rect.y2).render(this.config.themeConfig.transitionDuration);
            });
        }
        return rect;
    }
    addText(textContent, x, y, options = {}) {
        options = {
            fontSize: 12,
            fontFamily: null,
            anchor: 'middle',
            baseline: 'middle',
            angle: 0,
            stroke: 'none',
            latex: false,
            ...options,
        };
        const text = this.addPrimitive(primitives_1.TextPrimitive, options);
        text.setText(textContent)
            .setCoords(x, y)
            .setAngle(options.angle)
            .render();
        if (text.options.coordinateSystem === 'data') {
            text.createUpdateFunction(function () {
                text.setCoords(text.x, text.y)
                    .setAngle(text.angle)
                    .render(this.config.themeConfig.transitionDuration);
            });
        }
        return text;
    }
    addContour(fValues, xRange, yRange, options = {}) {
        options = {
            thresholds: 10,
            // className: 'primitive-contours',
            // colorScale: d3.interpolateRdBu,
            ...options,
        };
        const contour = this.addPrimitive(primitives_1.ContourPrimitive, options);
        contour.setData(fValues, xRange, yRange).render();
        if (contour.options.coordinateSystem === 'data') {
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
            width: null,
            coords: null,
            useCornerCoords: false,
            preserveAspectRatio: 'xMidYMid meet',
            ...options,
        };
        const image = this.addPrimitive(primitives_1.ImagePrimitive, options);
        image
            .loadImage(href)
            .then(() => {
            if (image.options.coordinateSystem === 'data') {
                image.createUpdateFunction(function () {
                    image.render(this.config.themeConfig.transitionDuration);
                });
            }
        })
            .catch((error) => {
            console.error('Image loading failed:', error);
        });
        return image;
    }
    addPoints(dataPoints, xAccessor, yAccessor, options = {}) {
        options = {
            size: 64,
            stroke: 'none',
            strokeWidth: 1,
            symbolType: d3.symbolCircle,
            keyAccessor: (d, i) => i,
            ...options,
        };
        const points = this.addPrimitive(primitives_1.BatchPointsPrimitive, options);
        points
            .setData(dataPoints, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .render();
        if (points.options.coordinateSystem === 'data') {
            points.createUpdateFunction(function () {
                points.render(this.config.themeConfig.transitionDuration);
            });
        }
        return points;
    }
    addLines(dataPoints, x1Accessor, y1Accessor, x2Accessor, y2Accessor, options = {}) {
        options = {
            className: 'primitive-batch-lines',
            // stroke: DEFAULT_PRIMITIVE_CONFIG.stroke,
            strokeWidth: 1.5,
            keyAccessor: (d, i) => i,
            arrow: 'none',
            ...options,
        };
        const lines = this.addPrimitive(primitives_1.BatchLinesPrimitive, options);
        lines
            .setData(dataPoints, options.keyAccessor)
            .setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor)
            .render();
        if (lines.options.coordinateSystem === 'data') {
            lines.createUpdateFunction(function () {
                lines.render(this.config.themeConfig.transitionDuration);
            });
        }
        return lines;
    }
    addRectangles(dataPoints, x1Accessor, y1Accessor, x2Accessor, y2Accessor, options = {}) {
        options = {
            className: 'primitive-batch-rectangles',
            fill: config_1.DEFAULT_PRIMITIVE_CONFIG.fill,
            stroke: 'none',
            strokeWidth: 1,
            keyAccessor: (d, i) => i,
            ...options,
        };
        const rectangles = this.addPrimitive(primitives_1.BatchRectanglesPrimitive, options);
        rectangles
            .setData(dataPoints, options.keyAccessor)
            .setCoordinateAccessors(x1Accessor, y1Accessor, x2Accessor, y2Accessor)
            .render();
        if (rectangles.options.coordinateSystem === 'data') {
            rectangles.createUpdateFunction(function () {
                rectangles.render(this.config.themeConfig.transitionDuration);
            });
        }
        return rectangles;
    }
    addTexts(dataPoints, xAccessor, yAccessor, textAccessor, options = {}) {
        options = {
            className: 'primitive-batch-text',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fill: 'currentColor',
            anchor: 'middle',
            baseline: 'middle',
            stroke: 'none',
            angleAccessor: undefined,
            keyAccessor: (d, i) => i,
            ...options,
        };
        const texts = this.addPrimitive(primitives_1.BatchTextPrimitive, options);
        texts
            .setData(dataPoints, options.keyAccessor)
            .setCoordinateAccessors(xAccessor, yAccessor)
            .setTextAccessor(textAccessor);
        if (options.angleAccessor) {
            texts.setAngleAccessor(options.angleAccessor);
        }
        texts.render();
        if (texts.options.coordinateSystem === 'data') {
            texts.createUpdateFunction(function () {
                texts.render(this.config.themeConfig.transitionDuration);
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
            this.layerObjectMap.forEach((layer) => {
                layer.primitiveIds.delete(id);
            });
            return true;
        }
        return false;
    }
    clearLayer(layerName) {
        if (this.layerObjectMap.has(layerName)) {
            const layerObject = this.layerObjectMap.get(layerName);
            // Remove all primitives in this layer
            layerObject.primitiveIds.forEach((id) => {
                const primitive = this.primitives.get(id);
                if (primitive) {
                    primitive.remove();
                    this.primitives.delete(id);
                }
            });
            // Clear the layer
            layerObject.layer.selectAll('*').remove();
            layerObject.primitiveIds.clear();
        }
    }
    clearAll() {
        this.primitives.forEach((primitive) => {
            primitive.remove();
        });
        this.layerObjectMap.forEach((layer) => {
            layer.layer.selectAll('*').remove();
            layer.primitiveIds.clear();
        });
        this.primitives.clear();
    }
    getPrimitivesByType(primitiveClass) {
        return Array.from(this.primitives.values()).filter((p) => p instanceof primitiveClass);
    }
    getPrimitivesByLayer(layerName) {
        const layer = this.layerObjectMap.get(layerName);
        if (!layer)
            return [];
        return Array.from(layer.primitiveIds)
            .map((id) => this.primitives.get(id))
            .filter(Boolean);
    }
}
exports.default = PrimitiveManager;
