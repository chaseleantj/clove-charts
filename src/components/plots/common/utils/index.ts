import * as d3 from 'd3';

import { CLOVE_CLASSES } from '../config/classes';
import {
    isStringArray,
    isNumberTuple,
    isDateTuple,
} from './type-guards';

export interface TextMeasurement {
    width: number;
    height: number;
}

export interface FontStyles {
    fontSize: number;
    fontFamily: string;
}

// Default fallback values if CSS cannot be read
const DEFAULT_FONT_STYLES: FontStyles = {
    fontSize: 12,
    fontFamily: 'sans-serif',
};

/**
 * Gets or creates a hidden SVG element for text measurement.
 * The SVG has the 'chart' class applied so it inherits CSS styles.
 */
function getMeasurementSvg(): d3.Selection<
    SVGSVGElement,
    unknown,
    HTMLElement,
    unknown
> {
    let measureSvg = d3.select<SVGSVGElement, unknown>('#__text-measure-svg');
    if (measureSvg.empty()) {
        measureSvg = d3
            .select('body')
            .append('svg')
            .attr('id', '__text-measure-svg')
            .attr('class', CLOVE_CLASSES.chart) // Apply chart class for CSS inheritance
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('pointer-events', 'none')
            .style('top', '-9999px')
            .style('left', '-9999px') as d3.Selection<
            SVGSVGElement,
            unknown,
            HTMLElement,
            unknown
        >;
    }
    return measureSvg;
}

/**
 * Gets the computed font styles for chart text elements from CSS.
 * Creates a temporary text element to read the actual computed styles.
 */
export function getChartFontStyles(): FontStyles {
    const measureSvg = getMeasurementSvg();
    const textEl = measureSvg.append('text');
    const node = textEl.node();

    if (!node) {
        textEl.remove();
        return DEFAULT_FONT_STYLES;
    }

    const computed = window.getComputedStyle(node);
    const fontSize =
        parseFloat(computed.fontSize) || DEFAULT_FONT_STYLES.fontSize;
    const fontFamily = computed.fontFamily || DEFAULT_FONT_STYLES.fontFamily;

    textEl.remove();
    return { fontSize, fontFamily };
}

/**
 * Measures the dimensions of text as it would be rendered in SVG.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
export function measureText(
    text: string,
    fontSize?: number,
    fontFamily?: string
): TextMeasurement {
    const measureSvg = getMeasurementSvg();

    // Use CSS styles if not explicitly provided
    if (fontSize === undefined || fontFamily === undefined) {
        const cssStyles = getChartFontStyles();
        fontSize = fontSize ?? cssStyles.fontSize;
        fontFamily = fontFamily ?? cssStyles.fontFamily;
    }

    const textElement = measureSvg
        .append('text')
        .attr('font-size', fontSize)
        .attr('font-family', fontFamily)
        .text(text);

    const bbox = textElement.node()?.getBBox() ?? { width: 0, height: 0 };
    const measurement = { width: bbox.width, height: bbox.height };

    textElement.remove();
    return measurement;
}

/**
 * Measures the maximum width among an array of text strings.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
export function measureMaxTextWidth(
    texts: string[],
    fontSize?: number,
    fontFamily?: string
): number {
    if (texts.length === 0) return 0;

    const measureSvg = getMeasurementSvg();

    // Use CSS styles if not explicitly provided
    if (fontSize === undefined || fontFamily === undefined) {
        const cssStyles = getChartFontStyles();
        fontSize = fontSize ?? cssStyles.fontSize;
        fontFamily = fontFamily ?? cssStyles.fontFamily;
    }

    let maxWidth = 0;

    for (const text of texts) {
        const textElement = measureSvg
            .append('text')
            .attr('font-size', fontSize)
            .attr('font-family', fontFamily)
            .text(text);

        const bbox = textElement.node()?.getBBox();
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
export function mergeWithDefaults<TConfig extends Record<string, any>>(
    defaults: TConfig,
    props: Partial<TConfig>
): TConfig {
    const result = { ...defaults };

    for (const key of Object.keys(defaults) as (keyof TConfig)[]) {
        if (props[key] !== undefined) {
            result[key] = props[key]!;
        }
    }

    return result;
}

/**
 * Gets the kind of domain based on its type.
 */
export function getDomainKind(
    domain: string[] | [Date, Date] | [number, number]
): 'string' | 'number' | 'date' | 'unknown' {
    if (isStringArray(domain)) return 'string';
    if (isNumberTuple(domain)) return 'number';
    if (isDateTuple(domain)) return 'date';
    return 'unknown';
}

// Re-export katex utilities
export { renderKatex } from './katex';
