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
const classes_1 = require("./config/classes");
const uuid_1 = require("uuid");
const utils_1 = require("./utils");
class LegendManager {
    constructor(legendConfig, containerNode) {
        this.legendConfig = legendConfig;
        this.container = d3.select(containerNode);
        this.gradientId = 'linear-gradient-' + (0, uuid_1.v4)();
        // Apply absolute positioning from config
        if (this.legendConfig.absolutePositions) {
            Object.entries(this.legendConfig.absolutePositions).forEach(([key, value]) => {
                if (value)
                    this.container.style(key, value);
            });
        }
        // Apply max height if set
        if (this.legendConfig.maxHeight) {
            this.container.style('max-height', `${this.legendConfig.maxHeight}px`);
        }
    }
    setTitle(title) {
        this.container.selectAll(`.${classes_1.CLOVE_CLASSES.legendTitle}`).remove();
        const newTitle = title !== null && title !== void 0 ? title : this.legendConfig.title;
        if (newTitle) {
            this.container
                .insert('div', ':first-child')
                .attr('class', classes_1.CLOVE_CLASSES.legendTitle)
                .text(newTitle);
        }
    }
    addLegend(scale, type, options = {}) {
        const domain = scale.domain();
        const domainKind = (0, utils_1.getDomainKind)(domain);
        if (domainKind === 'string') {
            const ordinalScale = scale;
            ordinalScale.domain().forEach((cls) => {
                const color = ordinalScale(cls);
                const itemStyles = { ...options };
                if (type === 'line') {
                    if (!itemStyles.stroke)
                        itemStyles.stroke = color;
                }
                else {
                    if (!itemStyles.fill)
                        itemStyles.fill = color;
                }
                this.addCategoricalItem(type, cls, itemStyles);
            });
        }
        else if (domainKind === 'number' || domainKind === 'date') {
            this.addContinuousLegend(scale);
        }
    }
    addCategoricalItem(type, label, itemStyles) {
        var _a, _b, _c;
        const row = this.container
            .append('div')
            .attr('class', classes_1.CLOVE_CLASSES.legendItem);
        // Symbol container with small SVG
        const symbol = row
            .append('div')
            .attr('class', classes_1.CLOVE_CLASSES.legendSymbol);
        const svg = symbol
            .append('svg')
            .attr('width', 14)
            .attr('height', 14)
            .style('overflow', 'visible');
        if (type === 'line') {
            const lineStyles = itemStyles;
            svg.append('line')
                .attr('x1', 0)
                .attr('y1', 7)
                .attr('x2', 14)
                .attr('y2', 7)
                .attr('stroke', lineStyles.stroke || 'currentColor')
                .attr('stroke-width', lineStyles.strokeWidth || 2)
                .attr('stroke-dasharray', lineStyles.strokeDashArray || '')
                .attr('opacity', (_a = lineStyles.opacity) !== null && _a !== void 0 ? _a : 1);
        }
        else if (type === 'point') {
            const pointStyles = itemStyles;
            const symbolGenerator = d3
                .symbol()
                .type(pointStyles.symbolType || d3.symbolCircle)
                .size(pointStyles.size || 50);
            svg.append('path')
                .attr('d', symbolGenerator)
                .attr('transform', 'translate(7, 7)')
                .attr('fill', pointStyles.fill || 'currentColor')
                .attr('stroke', pointStyles.stroke || 'none')
                .attr('stroke-width', pointStyles.strokeWidth || 1)
                .attr('opacity', (_b = pointStyles.opacity) !== null && _b !== void 0 ? _b : 1);
        }
        else if (type === 'rect') {
            const rectStyles = itemStyles;
            svg.append('rect')
                .attr('x', 1)
                .attr('y', 2)
                .attr('width', 12)
                .attr('height', 10)
                .attr('fill', rectStyles.fill || 'currentColor')
                .attr('stroke', rectStyles.stroke || 'none')
                .attr('stroke-width', rectStyles.strokeWidth || 1)
                .attr('opacity', (_c = rectStyles.opacity) !== null && _c !== void 0 ? _c : 1);
        }
        row.append('span').text(label);
    }
    addContinuousLegend(colorScale) {
        var _a;
        const wrapper = this.container
            .append('div')
            .style('text-align', 'left');
        const svg = wrapper.append('svg');
        const defs = svg.append('defs');
        const linearGradient = defs
            .append('linearGradient')
            .attr('id', this.gradientId)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 1)
            .attr('y2', 0);
        linearGradient
            .selectAll('stop')
            .data([0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => ({
            offset: `${t * 100}%`,
            color: colorScale(colorScale.domain()[0] +
                t *
                    (colorScale.domain()[1] -
                        colorScale.domain()[0])),
        })))
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color);
        svg.append('g')
            .append('rect')
            .attr('width', this.legendConfig.continuousBarWidth)
            .attr('height', this.legendConfig.continuousBarLength)
            .style('fill', `url(#${this.gradientId})`);
        const axisScale = d3
            .scaleLinear()
            .domain(colorScale.domain())
            .range([this.legendConfig.continuousBarLength, 0])
            .nice();
        const axisRight = (g) => g
            .attr('transform', `translate(${this.legendConfig.continuousBarWidth + 5}, 0)`)
            .call(d3.axisRight(axisScale).tickValues(axisScale.ticks(5)));
        svg.append('g').call(axisRight);
        // Set SVG dimensions based on content
        const bbox = (_a = svg.node()) === null || _a === void 0 ? void 0 : _a.getBBox();
        if (bbox) {
            const w = Math.max(bbox.width, 1);
            const h = Math.max(this.legendConfig.continuousBarLength + 10, 1);
            svg.attr('viewBox', `${bbox.x} ${bbox.y} ${w} ${h}`)
                .attr('width', w)
                .attr('height', h)
                .style('overflow', 'visible');
        }
    }
    clearLegend() {
        this.container.selectAll('*').remove();
    }
}
exports.default = LegendManager;
