"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderKatex = renderKatex;
const katex_1 = __importDefault(require("katex"));
function renderKatex(text, element, x, y, angle) {
    var _a, _b;
    if (!element)
        return element;
    const selection = 'selection' in element
        ? element.selection()
        : element;
    const nodeName = (_b = (_a = selection.node()) === null || _a === void 0 ? void 0 : _a.nodeName.toLowerCase()) !== null && _b !== void 0 ? _b : 'unknown';
    if (nodeName !== 'foreignobject') {
        console.warn('Expected a <foreignObject> element for KaTeX rendering, but got:', nodeName);
        return element;
    }
    // Set coordinates and transform immediately to support transitions
    element.attr('x', x).attr('y', y);
    if (angle) {
        element.attr('transform', `rotate(${angle}, ${x}, ${y})`);
    }
    else {
        // Optional: Remove transform if no angle, or reset it.
        // Adhering to previous behavior of only setting if angle exists.
        // But if animating from angle to 0, we might need to handle it.
        // For now, sticking to previous logic which only set if angle is truthy.
        // If the user sets angle to 0, it might not clear a previous rotation.
        // However, existing code checked `if (angle)`.
        if (angle === 0) {
            element.attr('transform', null);
        }
    }
    let div = selection.select('div.katex-wrapper');
    if (div.empty()) {
        div = selection
            .append('xhtml:div')
            .attr('class', 'katex-wrapper')
            .style('display', 'inline-block') // so width/height are tight
            .style('white-space', 'nowrap'); // prevent line‑break shrink
    }
    div.html(katex_1.default.renderToString(text || '', { throwOnError: false }));
    // Measure after next paint so layout is final
    requestAnimationFrame(() => {
        var _a, _b;
        const { width, height } = (_b = (_a = div.node()) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) !== null && _b !== void 0 ? _b : { width: 0, height: 0 };
        // Only set the dimensions afterwards, once the width and height are measured accurately
        // Use selection to set width/height instantly (snap)
        selection.attr('width', width).attr('height', height);
    });
    return element;
}
