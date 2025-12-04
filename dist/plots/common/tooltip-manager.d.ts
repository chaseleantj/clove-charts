import React from 'react';
import { TooltipConfig, TooltipValueFormatter } from './config';
export interface TooltipContent {
    label: string;
    value: unknown;
}
export interface ShowTooltipOptions {
    formatter?: TooltipValueFormatter;
}
declare class TooltipManager {
    private readonly config;
    private readonly wrapperRef;
    private tooltip;
    constructor(config: Required<TooltipConfig>, containerNode: HTMLDivElement, wrapperRef: React.RefObject<HTMLDivElement | null>);
    show<T extends Record<string, unknown>>(event: MouseEvent, data: T, keys: (keyof T)[], options?: ShowTooltipOptions): void;
    hide(): void;
    showTooltip(): void;
    hideTooltip(): void;
    positionTooltip(event: MouseEvent): void;
    formatTooltip(content: TooltipContent[], formatter?: TooltipValueFormatter): void;
    private defaultFormat;
    private getWrapperBounds;
}
export default TooltipManager;
