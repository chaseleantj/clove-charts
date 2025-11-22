'use client';

import { ReactNode, forwardRef, useMemo, useRef } from 'react';

import { LegendConfig, TooltipConfig } from '@/components/plots/common/config';

import styles from '@/components/page.module.css';

interface ChartLayoutProps {
    children: ReactNode;
}

export function ChartLayout({ children }: ChartLayoutProps) {
    return <div className={styles.chart}>{children}</div>;
}

interface ChartHeaderProps {
    children: ReactNode;
}

export function ChartHeader({ children }: ChartHeaderProps) {
    return <div className={styles.header}>{children}</div>;
}

interface ChartPlotWrapperProps {
    children: ReactNode;
}

export function ChartPlotWrapper({ children }: ChartPlotWrapperProps) {
    return (
        <div className={styles.plotWrapper}>
            <div className={styles.plot}>{children}</div>
        </div>
    );
}

interface ChartFooterProps {
    children: ReactNode;
}

export function ChartFooter({ children }: ChartFooterProps) {
    return <div className={styles.footer}>{children}</div>;
}

interface ChartCaptionsProps {
    children: ReactNode;
}

export function ChartCaptions({ children }: ChartCaptionsProps) {
    return (
        <div className={styles.captions}>
            {typeof children === 'string' ? <p>{children}</p> : children}
        </div>
    );
}

export const ChartLegend = forwardRef<HTMLDivElement>(
    function ChartLegend(_, ref) {
        return <div ref={ref} className={styles.legend}></div>;
    }
);

export const ChartTooltip = forwardRef<HTMLDivElement>(
    function ChartTooltip(_, ref) {
        return <div ref={ref} className={styles.tooltip}></div>;
    }
);

type LegendOverrides = Omit<LegendConfig, 'legendRef'>;
type TooltipOverrides = Omit<TooltipConfig, 'tooltipRef'>;

interface UseChartLegendReturn {
    legendRef: React.RefObject<HTMLDivElement | null>;
    legendConfig: LegendConfig;
}

interface UseChartTooltipReturn {
    tooltipRef: React.RefObject<HTMLDivElement | null>;
    tooltipConfig: TooltipConfig;
}

export function useChartLegend(
    legendOverrides?: LegendOverrides
): UseChartLegendReturn {
    const legendRef = useRef<HTMLDivElement>(null);

    const legendConfig = useMemo<LegendConfig>(
        () => ({
            legendRef,
            ...legendOverrides,
        }),
        [legendOverrides]
    );

    return { legendRef, legendConfig };
}

export function useChartTooltip(
    tooltipOverrides?: TooltipOverrides
): UseChartTooltipReturn {
    const tooltipRef = useRef<HTMLDivElement>(null);

    const tooltipConfig = useMemo<TooltipConfig>(
        () => ({
            tooltipRef,
            ...tooltipOverrides,
        }),
        [tooltipOverrides]
    );

    return { tooltipRef, tooltipConfig };
}
