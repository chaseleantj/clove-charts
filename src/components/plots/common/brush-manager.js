import * as d3 from 'd3'
import styles from './page.module.css'

class BrushManager {
    constructor(plot, extent, onBrush, resetBrush, transitionDuration) {
        this.brushing = false
        this.zoomed = false

        this.plot = plot
        this.extent = extent
        this.onBrush = onBrush
        this.resetBrush = resetBrush
        this.transitionDuration = transitionDuration
        this.setupBrush()
    }

    setupBrush() {
        this.brush = d3
            .brush()
            .extent(this.extent)
            .on('start', (event) => {
                this.brushing = true
            })
            .on('end', (event) => {
                this.handleBrushEnd(event)
                setTimeout(() => {
                    this.brushing = false
                }, this.transitionDuration)
            })

        this.brushElement = this.plot
            .append('g')
            .attr('class', 'brush')
            .attr('cursor', 'crosshair')
            .call(this.brush)
    }

    handleBrushEnd(event) {
        // Ignore programmatic events (e.g., brush.move)
        if (!event.sourceEvent) return
        const extent = event.selection
        if (!extent) {
            if (this.zoomed) {
                this.resetBrush()
                this.zoomed = false
            }
        } else {
            // Clear the brush selection so the user can make a new selection
            this.brushElement.call(this.brush.move, null)

            this.onBrush(extent)
            this.zoomed = true
        }
    }
}

export default BrushManager
