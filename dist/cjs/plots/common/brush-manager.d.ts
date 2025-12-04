import * as d3 from 'd3';
declare class BrushManager {
    private readonly plot;
    readonly extent: [[number, number], [number, number]];
    private readonly onBrush;
    readonly resetBrush: () => void;
    readonly transitionDuration: number;
    brushing: boolean;
    zoomed: boolean;
    brush: d3.BrushBehavior<unknown>;
    brushElement: d3.Selection<SVGGElement, unknown, null, undefined>;
    constructor(plot: d3.Selection<SVGGElement, unknown, null, undefined>, extent: [[number, number], [number, number]], onBrush: (...args: any[]) => void, resetBrush: () => void, transitionDuration: number);
    private handleBrushEnd;
}
export default BrushManager;
