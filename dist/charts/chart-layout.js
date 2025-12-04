'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { CLOVE_CLASSES } from '../plots/common/config/classes';
export function ChartLayout({ children }) {
    return _jsx("div", { className: CLOVE_CLASSES.chart, children: children });
}
export function ChartHeader({ children }) {
    return _jsx("div", { className: CLOVE_CLASSES.header, children: children });
}
export function ChartFooter({ children }) {
    return _jsx("div", { className: CLOVE_CLASSES.footer, children: children });
}
export function ChartCaptions({ children }) {
    return (_jsx("div", { className: CLOVE_CLASSES.captions, children: typeof children === 'string' ? _jsx("p", { children: children }) : children }));
}
