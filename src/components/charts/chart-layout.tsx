'use client';

import { ReactNode, forwardRef, useMemo, useRef } from 'react';

import {
    LegendConfig,
    TooltipConfig,
} from '@/components/plots/common/config';

import styles from '@/components/plots/common/page.module.css';

interface ChartLayoutProps {
    children: ReactNode;
    caption?: ReactNode;
}

export function ChartLayout({ children, caption }: ChartLayoutProps) {
    return (
        <div className={styles.chart}>
            <div className={styles.plotWrapper}>
                <div className={styles.plot}>{children}</div>
            </div>
            {caption && (
                <div className={styles.footer}>
                    <div className={styles.captions}>
                        {typeof caption === 'string' ? <p>{caption}</p> : caption}
                    </div>
                </div>
            )}
        </div>
    );
}

export const ChartLegend = forwardRef<HTMLDivElement>(function ChartLegend(
    _,
    ref
) {
    return <div ref={ref} className={styles.legend}></div>;
});

export const ChartTooltip = forwardRef<HTMLDivElement>(function ChartTooltip(
    _,
    ref
) {
    return <div ref={ref} className={styles.tooltip}></div>;
});

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

