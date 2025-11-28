import * as d3 from 'd3';
import React from 'react';

import styles from '@/components/page.module.css';
import {
    TooltipConfig,
    TooltipValueFormatter,
} from '@/components/plots/common/config';

export interface TooltipContent {
    label: string;
    value: unknown;
}

export interface ShowTooltipOptions {
    formatter?: TooltipValueFormatter;
}

class TooltipManager {
    private tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

    constructor(
        private readonly config: Required<TooltipConfig>,
        containerNode: HTMLDivElement,
        private readonly wrapperRef: React.RefObject<HTMLDivElement | null>
    ) {
        this.tooltip = d3.select(containerNode);
    }

    public show<T extends Record<string, unknown>>(
        event: MouseEvent,
        data: T,
        keys: (keyof T)[],
        options?: ShowTooltipOptions
    ): void {
        const formatter = options?.formatter ?? this.config.valueFormatter;

        const content: TooltipContent[] = keys.map((key) => ({
            label: String(key),
            value: data[key],
        }));

        this.formatTooltip(content, formatter ?? undefined);
        this.positionTooltip(event);
        this.showTooltip();
    }

    public hide(): void {
        this.hideTooltip();
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

        // Calculate initial position
        let x = event.pageX - wrapperRect.left + this.config.offsetX;
        let y = event.pageY - wrapperRect.top + this.config.offsetY;

        // Get tooltip dimensions for smart positioning
        const tooltipNode = this.tooltip.node();
        if (tooltipNode) {
            const tooltipRect = tooltipNode.getBoundingClientRect();
            const tooltipWidth = tooltipRect.width;
            const tooltipHeight = tooltipRect.height;
            const padding = this.config.edgePadding;

            // Flip horizontally if tooltip would overflow right edge
            if (x + tooltipWidth > wrapperRect.width - padding) {
                x =
                    event.pageX -
                    wrapperRect.left -
                    tooltipWidth -
                    this.config.offsetX;
            }

            // Ensure tooltip doesn't go past left edge
            if (x < padding) {
                x = padding;
            }

            // Flip vertically if tooltip would overflow bottom edge
            if (y + tooltipHeight > wrapperRect.height - padding) {
                y =
                    event.pageY -
                    wrapperRect.top -
                    tooltipHeight -
                    this.config.offsetY;
            }

            // Ensure tooltip doesn't go past top edge
            if (y < padding) {
                y = padding;
            }
        }

        this.tooltip.style('transform', `translate(${x}px, ${y}px)`);
    }

    public formatTooltip(
        content: TooltipContent[],
        formatter?: TooltipValueFormatter
    ): void {
        const html = content
            .map((c) => {
                const formattedValue = formatter
                    ? formatter(c.value, c.label)
                    : this.defaultFormat(c.value);
                return `<div class="${styles.tooltipRow}"><span class="${styles.tooltipLabel}">${c.label}</span><span class="${styles.tooltipValue}">${formattedValue}</span></div>`;
            })
            .join('');

        this.tooltip.html(html);
    }

    private defaultFormat(value: unknown): string {
        if (value === null || value === undefined) {
            return '—';
        }

        if (value instanceof Date) {
            return value.toLocaleDateString();
        }

        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                return value.toLocaleString();
            }
            // Round to 4 decimal places max, then remove trailing zeros
            const rounded = Math.round(value * 10000) / 10000;
            return rounded.toLocaleString(undefined, {
                maximumFractionDigits: 4,
            });
        }

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        return String(value);
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
