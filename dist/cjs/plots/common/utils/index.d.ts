export interface TextMeasurement {
    width: number;
    height: number;
}
export interface FontStyles {
    fontSize: number;
    fontFamily: string;
}
/**
 * Gets the computed font styles for chart text elements from CSS.
 * Creates a temporary text element to read the actual computed styles.
 */
export declare function getChartFontStyles(): FontStyles;
/**
 * Measures the dimensions of text as it would be rendered in SVG.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
export declare function measureText(text: string, fontSize?: number, fontFamily?: string): TextMeasurement;
/**
 * Measures the maximum width among an array of text strings.
 * Uses CSS-defined font styles by default (from .chart text class).
 */
export declare function measureMaxTextWidth(texts: string[], fontSize?: number, fontFamily?: string): number;
/**
 * Merges a partial config object with defaults, only including properties
 * that exist in the defaults object.
 */
export declare function mergeWithDefaults<TConfig extends Record<string, any>>(defaults: TConfig, props: Partial<TConfig>): TConfig;
/**
 * Gets the kind of domain based on its type.
 */
export declare function getDomainKind(domain: string[] | [Date, Date] | [number, number]): 'string' | 'number' | 'date' | 'unknown';
export { renderKatex } from './katex';
