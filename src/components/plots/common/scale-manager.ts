import * as d3 from 'd3';
import {
    AnyDomain,
    AnyRange,
    RequiredColorConfig,
} from '@/components/plots/common/config';

export type ContinuousD3Scale =
    | d3.ScaleTime<number, number>
    | d3.ScaleLogarithmic<number, number>
    | d3.ScaleLinear<number, number>;

export type AnyD3Scale =
    | d3.ScaleOrdinal<string, string | number>
    | ContinuousD3Scale;

export function isContinuousScale(
    scale: AnyD3Scale
): scale is ContinuousD3Scale {
    return 'invert' in scale;
}

function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) && value.length > 0 && typeof value[0] === 'string'
    );
}

function isNumberTuple(value: unknown): value is [number, number] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
    );
}

function isDateTuple(value: unknown): value is [Date, Date] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] instanceof Date &&
        value[1] instanceof Date
    );
}

class ScaleManager {
    constructor(private readonly colorConfig: RequiredColorConfig) {}

    getScale(
        domain: string[],
        range: string[] | [number, number],
        log?: false,
        formatNiceScales?: boolean
    ): d3.ScaleOrdinal<string, string | number>;

    getScale(
        domain: [Date, Date],
        range: [number, number],
        log?: false,
        formatNiceScales?: boolean
    ): d3.ScaleTime<number, number>;

    getScale(
        domain: [number, number],
        range: [number, number],
        log?: false,
        formatNiceScales?: boolean
    ): d3.ScaleLinear<number, number>;

    getScale(
        domain: [number, number],
        range: [number, number],
        log?: true,
        formatNiceScales?: boolean
    ): d3.ScaleLogarithmic<number, number>;

    getScale(
        domain: AnyDomain,
        range: AnyRange,
        log?: boolean,
        formatNiceScales?: boolean
    ): AnyD3Scale;

    getScale(
        domain: AnyDomain,
        range: AnyRange,
        log = false,
        formatNiceScales = false
    ): AnyD3Scale {
        if (isStringArray(domain)) {
            return d3
                .scaleOrdinal<string, string | number>()
                .domain(domain as string[])
                .range(range as string[] | number[]);
        }
        if (isDateTuple(domain)) {
            const scale = d3
                .scaleTime()
                .domain(domain as [Date, Date])
                .range(range as [number, number]);
            return formatNiceScales ? scale.nice() : scale;
        }
        if (isNumberTuple(domain)) {
            if (log) {
                const scale = d3
                    .scaleLog()
                    .domain(domain as [number, number])
                    .range(range as [number, number]);
                return formatNiceScales ? scale.nice() : scale;
            } else {
                const scale = d3
                    .scaleLinear()
                    .domain(domain as [number, number])
                    .range(range as [number, number]);
                return formatNiceScales ? scale.nice() : scale;
            }
        }

        throw new Error('Invalid domain type!');
    }

    getColorScale(
        domain?: [number, number] | [Date, Date],
        colorScheme?: (t: number) => string
    ): d3.ScaleSequential<string, never> | (() => string);

    getColorScale(
        domain?: string[],
        colorScheme?: readonly string[]
    ): d3.ScaleOrdinal<string, string>;

    getColorScale(
        domain?: AnyDomain,
        colorScheme?: readonly string[] | ((t: number) => string)
    ):
        | d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
        | (() => string) {
        const defaultScale = () => this.colorConfig.defaultColor;

        if (!domain) return defaultScale;

        if (isStringArray(domain)) {
            const colorRange =
                colorScheme ?? this.colorConfig.categoricalColorScheme;
            if (typeof colorRange === 'function') {
                throw new Error(
                    'Color scheme must be an array for categorical domains'
                );
            }
            return d3
                .scaleOrdinal<string, string>()
                .domain(domain)
                .range(colorRange);
        } else if (isNumberTuple(domain) || isDateTuple(domain)) {
            const colorInterpolator =
                colorScheme ?? this.colorConfig.continuousColorScheme;
            if (!colorInterpolator || typeof colorInterpolator !== 'function') {
                throw new Error(
                    'Color scheme must be an interpolator function for continuous domains'
                );
            }
            return d3.scaleSequential(colorInterpolator).domain(domain);
            // .nice();
        } else {
            return defaultScale;
        }
    }

    setScaleDomain(
        scale: AnyD3Scale,
        domain: AnyDomain,
        formatNiceScales: boolean
    ) {
        if (isStringArray(domain)) {
            const ordinalScale = scale as d3.ScaleOrdinal<
                string,
                string | number
            >;
            ordinalScale.domain(domain);
        } else if (isDateTuple(domain)) {
            const timeScale = scale as d3.ScaleTime<number, number>;
            if (formatNiceScales) {
                timeScale.domain(domain).nice();
            } else {
                timeScale.domain(domain);
            }
        } else if (isNumberTuple(domain)) {
            const numericScale = scale as
                | d3.ScaleLinear<number, number>
                | d3.ScaleLogarithmic<number, number>;
            if (formatNiceScales) {
                numericScale.domain(domain).nice();
            } else {
                numericScale.domain(domain);
            }
        }
    }

    getDomainToRangeFactor(
        scale:
            | d3.ScaleLinear<number, number>
            | d3.ScaleLogarithmic<number, number>
    ): number {
        const domain = scale.domain();
        const range = scale.range();

        return Math.abs(range[1] - range[0]) / Math.abs(domain[1] - domain[0]);
    }
}

export default ScaleManager;
