import * as d3 from 'd3';
import { CLOVE_CLASSES } from './config/classes';
import { isDateArray, isNumberArray, isStringArray, } from './utils/type-guards';
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
            .attr('class', CLOVE_CLASSES.axes)
            .attr('overflow', 'visible');
    }
    getFormatter(scale) {
        const domain = scale.domain();
        if (isNumberArray(domain)) {
            return (d) => this.axisConfig.defaultNumberFormat(d);
        }
        else if (isStringArray(domain)) {
            return (d) => this.axisConfig.defaultStringFormat(d);
        }
        else if (isDateArray(domain)) {
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
            .attr('class', CLOVE_CLASSES.xAxis)
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
            .attr('class', CLOVE_CLASSES.yAxis)
            .call(yAxis);
    }
    setXGrid() {
        this.x.call((g) => g
            .selectAll('.tick > line')
            .filter((d, i, nodes) => i < nodes.length)
            .clone()
            .attr('class', CLOVE_CLASSES.grid)
            .attr('pointer-events', 'none')
            .attr('y1', -this.plotHeight)
            .attr('y2', 0));
    }
    setYGrid() {
        this.y.call((g) => g
            .selectAll('.tick > line')
            .filter((d, i, nodes) => i < nodes.length)
            .clone()
            .attr('class', CLOVE_CLASSES.grid)
            .attr('pointer-events', 'none')
            .attr('x1', 0)
            .attr('x2', this.plotWidth));
    }
    setXLabel(label, margin) {
        this.x
            .append('g')
            .attr('transform', `translate(${this.plotWidth / 2}, ${margin - this.axisConfig.labelOffsetX})`)
            .attr('class', CLOVE_CLASSES.axisLabel)
            .append('text')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text(label);
    }
    setYLabel(label, margin) {
        this.y
            .append('g')
            .attr('transform', `translate(${-margin + this.axisConfig.labelOffsetY}, ${this.plotHeight / 2})`)
            .attr('class', CLOVE_CLASSES.axisLabel)
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
        this.x.call((g) => g.selectAll(`.${CLOVE_CLASSES.grid}`).remove());
    }
    removeYGrid() {
        this.y.call((g) => g.selectAll(`.${CLOVE_CLASSES.grid}`).remove());
    }
}
export default AxisManager;
