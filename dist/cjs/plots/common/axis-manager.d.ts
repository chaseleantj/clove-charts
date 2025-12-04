import * as d3 from 'd3';
import { AxisConfig } from './config';
declare class AxisManager {
    private readonly plotArea;
    private readonly plotWidth;
    private readonly plotHeight;
    private readonly axisConfig;
    x: d3.Selection<SVGGElement, unknown, null, undefined>;
    y: d3.Selection<SVGGElement, unknown, null, undefined>;
    axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    constructor(plotArea: d3.Selection<SVGGElement, unknown, null, undefined>, plotWidth: number, plotHeight: number, axisConfig: Required<AxisConfig>);
    private getFormatter;
    setXAxis(scale: d3.AxisScale<string>): void;
    setYAxis(scale: d3.AxisScale<string>): void;
    setXGrid(): void;
    setYGrid(): void;
    setXLabel(label: string | null, margin: number): void;
    setYLabel(label: string | null, margin: number): void;
    updateXAxis(scale: d3.AxisScale<string>, transitionDuration?: number): void;
    updateYAxis(scale: d3.AxisScale<string>, transitionDuration?: number): void;
    removeXGrid(): void;
    removeYGrid(): void;
}
export default AxisManager;
