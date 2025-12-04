import * as d3 from 'd3';
import { ColorConfig, ScaleConfig } from './config';
export type ContinuousD3Scale = d3.ScaleTime<number, number> | d3.ScaleLogarithmic<number, number> | d3.ScaleLinear<number, number>;
export type CategoricalScale = d3.ScaleOrdinal<string, string | number> | d3.ScaleBand<string>;
export type D3Scale = CategoricalScale | ContinuousD3Scale;
export declare function isContinuousScale(scale: D3Scale): scale is ContinuousD3Scale;
declare class ScaleManager {
    private readonly scaleConfig;
    private readonly colorConfig;
    constructor(scaleConfig: Required<ScaleConfig>, colorConfig: Required<ColorConfig>);
    getScale(domain: string[], range: [number, number], log?: false, formatNiceScales?: boolean): d3.ScaleBand<string>;
    getScale(domain: string[], range: string[], log?: false, formatNiceScales?: boolean): d3.ScaleOrdinal<string, string | number>;
    getScale(domain: [Date, Date], range: [number, number], log?: false, formatNiceScales?: boolean): d3.ScaleTime<number, number>;
    getScale(domain: [number, number], range: [number, number], log?: false, formatNiceScales?: boolean): d3.ScaleLinear<number, number>;
    getScale(domain: [number, number], range: [number, number], log?: true, formatNiceScales?: boolean): d3.ScaleLogarithmic<number, number>;
    getScale(domain: string[] | [Date, Date] | [number, number], range: string[] | [number, number], log?: boolean, formatNiceScales?: boolean): D3Scale;
    getColorScale(domain: string[] | [Date, Date] | [number, number], colorScheme?: readonly string[] | ((t: number) => string)): d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string>;
    setScaleDomain(scale: D3Scale, domain: string[] | [Date, Date] | [number, number], formatNiceScales: boolean): void;
    getDomainToRangeFactor(scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>): number;
    getScaleX(domain: string[] | [Date, Date] | [number, number], plotWidth: number): D3Scale;
    getScaleY(domain: string[] | [Date, Date] | [number, number], plotHeight: number): D3Scale;
}
export default ScaleManager;
