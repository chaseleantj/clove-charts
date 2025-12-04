import * as d3 from 'd3';
import { ColorConfig, ScaleConfig } from './config';
import {
    isDateTuple,
    isNumberTuple,
    isStringArray,
} from './utils/type-guards';

export type ContinuousD3Scale =
    | d3.ScaleTime<number, number>
    | d3.ScaleLogarithmic<number, number>
    | d3.ScaleLinear<number, number>;

export type CategoricalScale =
    | d3.ScaleOrdinal<string, string | number>
    | d3.ScaleBand<string>;

export type D3Scale = CategoricalScale | ContinuousD3Scale;

export function isContinuousScale(scale: D3Scale): scale is ContinuousD3Scale {
    return 'invert' in scale;
}

class ScaleManager {
    constructor(
        private readonly scaleConfig: Required<ScaleConfig>,
        private readonly colorConfig: Required<ColorConfig>
    ) {}

    getScale(
        domain: string[],
        range: [number, number],
        log?: false,
        formatNiceScales?: boolean
    ): d3.ScaleBand<string>;

    getScale(
        domain: string[],
        range: string[],
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
        domain: string[] | [Date, Date] | [number, number],
        range: string[] | [number, number],
        log?: boolean,
        formatNiceScales?: boolean
    ): D3Scale;

    public getScale(
        domain: string[] | [Date, Date] | [number, number],
        range: string[] | [number, number],
        log = false,
        formatNiceScales = false
    ): D3Scale {
        if (isStringArray(domain)) {
            if (isNumberTuple(range)) {
                return d3.scaleBand().domain(domain).range(range);
            }
            return d3
                .scaleOrdinal<string, string | number>()
                .domain(domain)
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

    public getColorScale(
        domain: string[] | [Date, Date] | [number, number],
        colorScheme?: readonly string[] | ((t: number) => string)
    ): d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string> {
        if (isStringArray(domain)) {
            const colorRange = (colorScheme ??
                this.colorConfig.categoricalColorScheme) as string[];

            return d3
                .scaleOrdinal<string, string>()
                .domain(domain)
                .range(colorRange);
        } else {
            const colorInterpolator =
                colorScheme ?? this.colorConfig.continuousColorScheme;
            return d3.scaleSequential(colorInterpolator).domain(domain);
            // .nice();
        }
    }

    public setScaleDomain(
        scale: D3Scale,
        domain: string[] | [Date, Date] | [number, number],
        formatNiceScales: boolean
    ) {
        if (isStringArray(domain)) {
            const categoricalScale = scale as CategoricalScale;
            categoricalScale.domain(domain);
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

    public getDomainToRangeFactor(
        scale:
            | d3.ScaleLinear<number, number>
            | d3.ScaleLogarithmic<number, number>
    ): number {
        const domain = scale.domain();
        const range = scale.range();

        return Math.abs(range[1] - range[0]) / Math.abs(domain[1] - domain[0]);
    }

    public getScaleX(
        domain: string[] | [Date, Date] | [number, number],
        plotWidth: number
    ): D3Scale {
        const log = this.scaleConfig?.logX ?? false;
        const formatNice = this.scaleConfig?.formatNiceX ?? false;
        return this.getScale(domain, [0, plotWidth], log, formatNice);
    }

    public getScaleY(
        domain: string[] | [Date, Date] | [number, number],
        plotHeight: number
    ): D3Scale {
        const log = this.scaleConfig?.logY ?? false;
        const formatNice = this.scaleConfig?.formatNiceY ?? false;
        return this.getScale(domain, [plotHeight, 0], log, formatNice);
    }
}

export default ScaleManager;
