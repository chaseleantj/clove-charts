'use client';

import { ReactNode } from 'react';

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
