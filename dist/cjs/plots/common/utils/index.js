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
exports.renderKatex = void 0;
exports.getChartFontStyles = getChartFontStyles;
exports.measureText = measureText;
exports.measureMaxTextWidth = measureMaxTextWidth;
exports.mergeWithDefaults = mergeWithDefaults;
exports.getDomainKind = getDomainKind;
const d3 = __importStar(require("d3"));
const classes_1 = require("../config/classes");
const type_guards_1 = require("./type-guards");
// Default fallback values if CSS cannot be read
const DEFAULT_FONT_STYLES = {
    fontSize: 12,
    fontFamily: 'sans-serif',
};
/**
 * Gets or creates a hidden SVG element for text measurement.
 * The SVG has the 'chart' class applied so it inherits CSS styles.
 */
function getMeasurementSvg() {
    let measureSvg = d3.select('#__text-measure-svg');
    if (measureSvg.empty()) {
        measureSvg = d3
            .select('body')
            .append('svg')
            .attr('id', '__text-measure-svg')
            .attr('class', classes_1.CLOVE_CLASSES.chart) // Apply chart class for CSS inheritance
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('pointer-events', 'none')
            .style('top', '-9999px')
            .style('left', '-9999px');
    }
    return measureSvg;
}
/**
 * Gets the computed font styles for chart text elements from CSS.
 * Creates a temporary text element to read the actual computed styles.
 */
function getChartFontStyles() {
    const measureSvg = getMeasurementSvg();
    const textEl = measureSvg.append('text');
    const node = textEl.node();
    if (!node) {
        textEl.remove();
        return DEFAULT_FONT_STYLES;
    }
    const computed = window.getComputedStyle(node);
    const fontSize = parseFloat(computed.fontSize) || DEFAULT_FONT_STYLES.fontSize;
    const fontFamily = computed.fontFamily || DEFAULT_FONT_STYLES.fontFamily;
    textEl.remove();
    return { fontSize, fontFamily };
}
/**
 * Measures the dimensions of text as it would be rendered in SVG.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
function measureText(text, fontSize, fontFamily) {
    var _a, _b;
    const measureSvg = getMeasurementSvg();
    // Use CSS styles if not explicitly provided
    if (fontSize === undefined || fontFamily === undefined) {
        const cssStyles = getChartFontStyles();
        fontSize = fontSize !== null && fontSize !== void 0 ? fontSize : cssStyles.fontSize;
        fontFamily = fontFamily !== null && fontFamily !== void 0 ? fontFamily : cssStyles.fontFamily;
    }
    const textElement = measureSvg
        .append('text')
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .text(text);
    const bbox = (_b = (_a = textElement.node()) === null || _a === void 0 ? void 0 : _a.getBBox()) !== null && _b !== void 0 ? _b : { width: 0, height: 0 };
    const measurement = { width: bbox.width, height: bbox.height };
    textElement.remove();
    return measurement;
}
/**
 * Measures the maximum width among an array of text strings.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
function measureMaxTextWidth(texts, fontSize, fontFamily) {
    var _a;
    if (texts.length === 0)
        return 0;
    const measureSvg = getMeasurementSvg();
    // Use CSS styles if not explicitly provided
    if (fontSize === undefined || fontFamily === undefined) {
        const cssStyles = getChartFontStyles();
        fontSize = fontSize !== null && fontSize !== void 0 ? fontSize : cssStyles.fontSize;
        fontFamily = fontFamily !== null && fontFamily !== void 0 ? fontFamily : cssStyles.fontFamily;
    }
    let maxWidth = 0;
    for (const text of texts) {
        const textElement = measureSvg
            .append('text')
            .attr('font-size', fontSize)
            .attr('font-family', fontFamily)
            .text(text);
        const bbox = (_a = textElement.node()) === null || _a === void 0 ? void 0 : _a.getBBox();
        if (bbox && bbox.width > maxWidth) {
            maxWidth = bbox.width;
        }
        textElement.remove();
    }
    return maxWidth;
}
/**
 * Merges a partial config object with defaults, only including properties
 * that exist in the defaults object.
 */
function mergeWithDefaults(defaults, props) {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
        if (props[key] !== undefined) {
            result[key] = props[key];
        }
    }
    return result;
}
/**
 * Gets the kind of domain based on its type.
 */
function getDomainKind(domain) {
    if ((0, type_guards_1.isStringArray)(domain))
        return 'string';
    if ((0, type_guards_1.isNumberTuple)(domain))
        return 'number';
    if ((0, type_guards_1.isDateTuple)(domain))
        return 'date';
    return 'unknown';
}
// Re-export katex utilities
var katex_1 = require("./katex");
Object.defineProperty(exports, "renderKatex", { enumerable: true, get: function () { return katex_1.renderKatex; } });
