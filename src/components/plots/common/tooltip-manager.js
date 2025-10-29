import * as d3 from 'd3';

class TooltipManager {
    constructor(tooltipConfig, plotRef) {
        this.config = tooltipConfig;
        this.tooltip = d3.select(this.config.tooltipRef.current);
        this.plotRef = plotRef;
    }

    show() {
        this.tooltip.style('opacity', 1);
    }

    hide() {
        this.tooltip.style('opacity', 0);
    }

    positionTooltip(event) {
        const x =
            event.pageX - this.getBoundingClient().left + this.config.offsetX;
        const y =
            event.pageY - this.getBoundingClient().top + this.config.offsetY;
        this.tooltip.style('transform', `translate(${x}px,${y}px)`);
    }

    formatTooltip(d, displayClasses) {
        let content = '';
        displayClasses = [...new Set(displayClasses)];
        for (let displayClass of displayClasses) {
            const data = d[displayClass];
            if (data) {
                let displayData = data;
                if (typeof data === 'number') {
                    displayData = Math.round(data * 1e3, 3) / 1e3;
                }
                content += `${displayClass}: ${displayData}<br/>`;
            }
        }
        this.tooltip.html(content);
    }

    // Returns an object with the absolute left and top position of the current chart as well as the width and height. Used for moving tooltips.
    getBoundingClient() {
        const rect = this.plotRef.current.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }
}

export default TooltipManager;
