import * as d3 from 'd3';
import React from 'react';

import { RequiredTooltipConfig } from '@/components/plots/common/config';
import { DEFAULT_TICK_FORMAT } from '@/components/plots/common/config';

class TooltipManager {
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    constructor(
        private readonly tooltipConfig: RequiredTooltipConfig,
        private readonly plotRef: React.RefObject<HTMLDivElement | null>
    ) {
        this.tooltip = d3.select(this.tooltipConfig.tooltipRef.current!);
        this.plotRef = plotRef;
    }

    public showTooltip(): void {
        this.tooltip.style('opacity', 1);
    }

    public hideTooltip(): void {
        this.tooltip.style('opacity', 0);
    }

    public positionTooltip(event: MouseEvent): void {
        const x =
            event.pageX -
            this.getBoundingClient().left +
            this.tooltipConfig.offsetX;
        const y =
            event.pageY -
            this.getBoundingClient().top +
            this.tooltipConfig.offsetY;
        this.tooltip.style('transform', `translate(${x}px,${y}px)`);
    }

    public formatTooltip(
        d: Record<string, any>,
        displayClasses: string[]
    ): void {
        let content = '';
        displayClasses = [...new Set(displayClasses)];
        for (let displayClass of displayClasses) {
            const data = d[displayClass];
            if (data) {
                let displayData = data;
                if (typeof data === 'number') {
                    displayData = DEFAULT_TICK_FORMAT(data);
                }
                content += `${displayClass}: ${displayData}<br/>`;
            }
        }
        this.tooltip.html(content);
    }

    // Returns an object with the absolute left and top position of the current chart as well as the width and height. Used for moving tooltips.
    private getBoundingClient() {
        if (!this.plotRef.current) {
            throw new Error('Plot ref is not available');
        }
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
