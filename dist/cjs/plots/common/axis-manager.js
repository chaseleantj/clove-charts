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
const type_guards_1 = require("./utils/type-guards");
class AxisManager {
    constructor(plotArea, plotWidth, plotHeight, axisConfig) {
        this.plotArea = plotArea;
        this.plotWidth = plotWidth;
        this.plotHeight = plotHeight;
        this.axisConfig = axisConfig;
        this.plotArea = plotArea;
        this.plotWidth = plotWidth;
        this.plotHeight = plotHeight;
        this.axisGroup = this.plotArea
            .append('g')
            .attr('class', classes_1.CLOVE_CLASSES.axes)
            .attr('overflow', 'visible');
    }
    getFormatter(scale) {
        const domain = scale.domain();
        if ((0, type_guards_1.isNumberArray)(domain)) {
            return (d) => this.axisConfig.defaultNumberFormat(d);
        }
        else if ((0, type_guards_1.isStringArray)(domain)) {
            return (d) => this.axisConfig.defaultStringFormat(d);
        }
        else if ((0, type_guards_1.isDateArray)(domain)) {
            return null;
        }
        return null;
    }
    setXAxis(scale) {
        let xAxis = d3
            .axisBottom(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);
        const formatter = this.axisConfig.tickFormatX || this.getFormatter(scale);
        xAxis = formatter ? xAxis.tickFormat(formatter) : xAxis;
        this.x = this.axisGroup
            .append('g')
            .attr('transform', `translate(0, ${this.plotHeight})`)
            .attr('class', classes_1.CLOVE_CLASSES.xAxis)
            .call(xAxis);
    }
    setYAxis(scale) {
        let yAxis = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);
        const formatter = this.axisConfig.tickFormatY || this.getFormatter(scale);
        yAxis = formatter ? yAxis.tickFormat(formatter) : yAxis;
        this.y = this.axisGroup
            .append('g')
            .attr('class', classes_1.CLOVE_CLASSES.yAxis)
            .call(yAxis);
    }
    setXGrid() {
        this.x.call((g) => g
            .selectAll('.tick > line')
            .filter((d, i, nodes) => i < nodes.length)
            .clone()
            .attr('class', classes_1.CLOVE_CLASSES.grid)
            .attr('pointer-events', 'none')
            .attr('y1', -this.plotHeight)
            .attr('y2', 0));
    }
    setYGrid() {
        this.y.call((g) => g
            .selectAll('.tick > line')
            .filter((d, i, nodes) => i < nodes.length)
            .clone()
            .attr('class', classes_1.CLOVE_CLASSES.grid)
            .attr('pointer-events', 'none')
            .attr('x1', 0)
            .attr('x2', this.plotWidth));
    }
    setXLabel(label, margin) {
        this.x
            .append('g')
            .attr('transform', `translate(${this.plotWidth / 2}, ${margin - this.axisConfig.labelOffsetX})`)
            .attr('class', classes_1.CLOVE_CLASSES.axisLabel)
            .append('text')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text(label);
    }
    setYLabel(label, margin) {
        this.y
            .append('g')
            .attr('transform', `translate(${-margin + this.axisConfig.labelOffsetY}, ${this.plotHeight / 2})`)
            .attr('class', classes_1.CLOVE_CLASSES.axisLabel)
            .append('text')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text(label);
    }
    updateXAxis(scale, transitionDuration = 0) {
        let xAxis = d3
            .axisBottom(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);
        const formatter = this.axisConfig.tickFormatX || this.getFormatter(scale);
        if (formatter) {
            xAxis = xAxis.tickFormat(formatter);
        }
        this.x.transition().duration(transitionDuration).call(xAxis);
    }
    updateYAxis(scale, transitionDuration = 0) {
        let yAxis = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);
        const formatter = this.axisConfig.tickFormatY || this.getFormatter(scale);
        if (formatter) {
            yAxis = yAxis.tickFormat(formatter);
        }
        this.y.transition().duration(transitionDuration).call(yAxis);
    }
    removeXGrid() {
        this.x.call((g) => g.selectAll(`.${classes_1.CLOVE_CLASSES.grid}`).remove());
    }
    removeYGrid() {
        this.y.call((g) => g.selectAll(`.${classes_1.CLOVE_CLASSES.grid}`).remove());
    }
}
exports.default = AxisManager;
