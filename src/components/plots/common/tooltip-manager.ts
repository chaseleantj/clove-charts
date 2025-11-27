import * as d3 from 'd3';
import React from 'react';

import { TooltipConfig } from '@/components/plots/common/config';

class TooltipManager {
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    constructor(
        private readonly tooltipConfig: Required<TooltipConfig>,
        containerNode: HTMLDivElement,
        private readonly wrapperRef: React.RefObject<HTMLDivElement | null>
    ) {
        this.tooltip = d3.select(containerNode);
    }

    public showTooltip(): void {
        this.tooltip.style('opacity', 1);
    }

    public hideTooltip(): void {
        this.tooltip.style('opacity', 0);
    }

    public positionTooltip(event: MouseEvent): void {
        const wrapperRect = this.getWrapperBounds();
        if (!wrapperRect) return;

        const x = event.pageX - wrapperRect.left + this.tooltipConfig.offsetX;
        const y = event.pageY - wrapperRect.top + this.tooltipConfig.offsetY;

        this.tooltip.style('transform', `translate(${x}px, ${y}px)`);
    }

    public formatTooltip(d: Record<string, any>, displayKeys: string[]): void {
        const uniqueKeys = [...new Set(displayKeys)];
        const content = uniqueKeys
            .filter((key) => d[key] !== undefined && d[key] !== null)
            .map((key) => {
                const val =
                    typeof d[key] === 'number'
                        ? d3.format('.3f')(d[key])
                        : d[key];
                return `<div>${key}: ${val}</div>`;
            })
            .join('');

        this.tooltip.html(content);
    }

    private getWrapperBounds() {
        if (!this.wrapperRef.current) {
            return null;
        }
        const rect = this.wrapperRef.current.getBoundingClientRect();
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }
}

export default TooltipManager;
