import katex from 'katex';
import * as d3 from 'd3';

import styles from '@/components/page.module.css';

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
            .attr('class', styles.chart) // Apply chart class for CSS inheritance
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

export function renderKatex(
    text: string,
    element:
        | d3.Selection<SVGForeignObjectElement, unknown, null, undefined>
        | d3.Transition<SVGForeignObjectElement, unknown, null, undefined>,
    x: number,
    y: number,
    angle?: number
):
    | d3.Selection<SVGForeignObjectElement, unknown, null, undefined>
    | d3.Transition<SVGForeignObjectElement, unknown, null, undefined> {
    if (!element) return element;

    const selection =
        'selection' in element
            ? (
                  element as d3.Transition<
                      SVGForeignObjectElement,
                      unknown,
                      null,
                      undefined
                  >
              ).selection()
            : (element as d3.Selection<
                  SVGForeignObjectElement,
                  unknown,
                  null,
                  undefined
              >);

    const nodeName = selection.node()?.nodeName.toLowerCase() ?? 'unknown';

    if (nodeName !== 'foreignobject') {
        console.warn(
            'Expected a <foreignObject> element for KaTeX rendering, but got:',
            nodeName
        );
        return element;
    }

    // Set coordinates and transform immediately to support transitions
    (element as any).attr('x', x).attr('y', y);

    if (angle) {
        (element as any).attr('transform', `rotate(${angle}, ${x}, ${y})`);
    } else {
        // Optional: Remove transform if no angle, or reset it.
        // Adhering to previous behavior of only setting if angle exists.
        // But if animating from angle to 0, we might need to handle it.
        // For now, sticking to previous logic which only set if angle is truthy.
        // If the user sets angle to 0, it might not clear a previous rotation.
        // However, existing code checked `if (angle)`.
        if (angle === 0) {
            (element as any).attr('transform', null);
        }
    }

    let div = selection.select('div.katex-wrapper');
    if (div.empty()) {
        div = selection
            .append('xhtml:div')
            .attr('class', 'katex-wrapper')
            .style('display', 'inline-block') // so width/height are tight
            .style('white-space', 'nowrap'); // prevent line‑break shrink
    }

    div.html(katex.renderToString(text || '', { throwOnError: false }));

    // Measure after next paint so layout is final
    requestAnimationFrame(() => {
        const { width, height } = (
            div.node() as Element
        )?.getBoundingClientRect() ?? { width: 0, height: 0 };

        // Only set the dimensions afterwards, once the width and height are measured accurately
        // Use selection to set width/height instantly (snap)
        selection.attr('width', width).attr('height', height);
    });
    return element;
}
