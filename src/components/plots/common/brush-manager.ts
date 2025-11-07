import * as d3 from 'd3';

class BrushManager {
    brushing: boolean;
    zoomed: boolean;

    brush: d3.BrushBehavior<unknown>;
    brushElement: d3.Selection<SVGGElement, unknown, null, undefined>;

    constructor(
        private readonly plot: d3.Selection<
            SVGGElement,
            unknown,
            null,
            undefined
        >,
        public readonly extent: [[number, number], [number, number]],
        private readonly onBrush: (...args: any[]) => void,
        public readonly resetBrush: () => void,
        public readonly transitionDuration: number
    ) {
        this.brushing = false;
        this.zoomed = false;

        this.plot = plot;
        this.extent = extent;
        this.onBrush = onBrush;
        this.resetBrush = resetBrush;
        this.transitionDuration = transitionDuration;

        this.brush = d3
            .brush()
            .extent(this.extent)
            .on('start', () => {
                this.brushing = true;
            })
            .on('end', (event: d3.D3BrushEvent<unknown>) => {
                this.handleBrushEnd(event);
                setTimeout(() => {
                    this.brushing = false;
                }, this.transitionDuration);
            });

        this.brushElement = this.plot
            .append('g')
            .attr('class', 'brush')
            .attr('cursor', 'crosshair')
            .call(this.brush);
    }

    private handleBrushEnd(event: d3.D3BrushEvent<unknown>): void {
        // Ignore programmatic events (e.g., brush.move)
        if (!event.sourceEvent) return;
        const extent = event.selection;
        if (!extent) {
            if (this.zoomed) {
                this.resetBrush();
                this.zoomed = false;
            }
        } else {
            // Clear the brush selection so the user can make a new selection
            this.brushElement.call(this.brush.move, null);

            this.onBrush(extent);
            this.zoomed = true;
        }
    }
}

export default BrushManager;
