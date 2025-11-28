'use client';

import { ReactNode } from 'react';

import { CLOVE_CLASSES } from '@/components/plots/common/class-names';

interface ChartLayoutProps {
    children: ReactNode;
}

export function ChartLayout({ children }: ChartLayoutProps) {
    return <div className={CLOVE_CLASSES.chart}>{children}</div>;
}

interface ChartHeaderProps {
    children: ReactNode;
}

export function ChartHeader({ children }: ChartHeaderProps) {
    return <div className={CLOVE_CLASSES.header}>{children}</div>;
}

interface ChartFooterProps {
    children: ReactNode;
}

export function ChartFooter({ children }: ChartFooterProps) {
    return <div className={CLOVE_CLASSES.footer}>{children}</div>;
}

interface ChartCaptionsProps {
    children: ReactNode;
}

export function ChartCaptions({ children }: ChartCaptionsProps) {
    return (
        <div className={CLOVE_CLASSES.captions}>
            {typeof children === 'string' ? <p>{children}</p> : children}
        </div>
    );
}
