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
class BrushManager {
    constructor(plot, extent, onBrush, resetBrush, transitionDuration) {
        this.plot = plot;
        this.extent = extent;
        this.onBrush = onBrush;
        this.resetBrush = resetBrush;
        this.transitionDuration = transitionDuration;
        this.brushing = false;
        this.zoomed = false;
        this.plot = plot;
        this.extent = extent;
        this.onBrush = onBrush;
        this.resetBrush = resetBrush;
        this.transitionDuration = transitionDuration;
        this.brush = d3
            .brush()
            .extent(this.extent)
            .on('start', () => {
            this.brushing = true;
        })
            .on('end', (event) => {
            this.handleBrushEnd(event);
            setTimeout(() => {
                this.brushing = false;
            }, this.transitionDuration);
        });
        this.brushElement = this.plot
            .append('g')
            .attr('class', 'brush')
            .attr('cursor', 'crosshair')
            .call(this.brush);
    }
    handleBrushEnd(event) {
        // Ignore programmatic events (e.g., brush.move)
        if (!event.sourceEvent)
            return;
        const extent = event.selection;
        if (!extent) {
            if (this.zoomed) {
                this.resetBrush();
                this.zoomed = false;
            }
        }
        else {
            // Clear the brush selection so the user can make a new selection
            this.brushElement.call(this.brush.move, null);
            this.onBrush(extent);
            this.zoomed = true;
        }
    }
}
exports.default = BrushManager;
