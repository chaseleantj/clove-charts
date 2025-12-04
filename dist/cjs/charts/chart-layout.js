'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartLayout = ChartLayout;
exports.ChartHeader = ChartHeader;
exports.ChartFooter = ChartFooter;
exports.ChartCaptions = ChartCaptions;
const jsx_runtime_1 = require("react/jsx-runtime");
const classes_1 = require("../plots/common/config/classes");
function ChartLayout({ children }) {
    return (0, jsx_runtime_1.jsx)("div", { className: classes_1.CLOVE_CLASSES.chart, children: children });
}
function ChartHeader({ children }) {
    return (0, jsx_runtime_1.jsx)("div", { className: classes_1.CLOVE_CLASSES.header, children: children });
}
function ChartFooter({ children }) {
    return (0, jsx_runtime_1.jsx)("div", { className: classes_1.CLOVE_CLASSES.footer, children: children });
}
function ChartCaptions({ children }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: classes_1.CLOVE_CLASSES.captions, children: typeof children === 'string' ? (0, jsx_runtime_1.jsx)("p", { children: children }) : children }));
}
