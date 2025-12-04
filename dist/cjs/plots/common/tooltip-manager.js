"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const d3 = __importStar(require("d3"));
const classes_1 = require("./config/classes");
class TooltipManager {
    constructor(config, containerNode, wrapperRef) {
        this.config = config;
        this.wrapperRef = wrapperRef;
        this.tooltip = d3.select(containerNode);
    }
    show(event, data, keys, options) {
        var _a;
        const formatter = (_a = options === null || options === void 0 ? void 0 : options.formatter) !== null && _a !== void 0 ? _a : this.config.valueFormatter;
        const content = keys.map((key) => ({
            label: String(key),
            value: data[key],
        }));
        this.formatTooltip(content, formatter !== null && formatter !== void 0 ? formatter : undefined);
        this.positionTooltip(event);
        this.showTooltip();
    }
    hide() {
        this.hideTooltip();
    }
    showTooltip() {
        this.tooltip.style('opacity', 1);
    }
    hideTooltip() {
        this.tooltip.style('opacity', 0);
    }
    positionTooltip(event) {
        const wrapperRect = this.getWrapperBounds();
        if (!wrapperRect)
            return;
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
    formatTooltip(content, formatter) {
        const html = content
            .map((c) => {
            const formattedValue = formatter
                ? formatter(c.value, c.label)
                : this.defaultFormat(c.value);
            return `<div class="${classes_1.CLOVE_CLASSES.tooltipRow}"><span class="${classes_1.CLOVE_CLASSES.tooltipLabel}">${c.label}</span><span class="${classes_1.CLOVE_CLASSES.tooltipValue}">${formattedValue}</span></div>`;
        })
            .join('');
        this.tooltip.html(html);
    }
    defaultFormat(value) {
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
    getWrapperBounds() {
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
exports.default = TooltipManager;
