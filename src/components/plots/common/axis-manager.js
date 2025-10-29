import * as d3 from 'd3'
import { DEFAULT_AXIS_CONFIG } from './config'

class AxisManager {
    constructor(plotArea, plotWidth, plotHeight, axisConfig = {}) {
        this.plotArea = plotArea
        this.plotWidth = plotWidth
        this.plotHeight = plotHeight

        this.config = {
            ...DEFAULT_AXIS_CONFIG,
            ...axisConfig,
        }

        this.axisGroup = this.plotArea
            .append('g')
            .attr('class', 'axes')
            .attr('overflow', 'visible')
    }

    setXAxis(scale) {
        this.x = this.axisGroup
            .append('g')
            .attr('transform', `translate(0, ${this.plotHeight})`)
            .attr('class', `x-axis`)
            .call(
                d3
                    .axisBottom(scale)
                    .ticks(this.config.tickCount)
                    .tickSize(this.config.tickSize)
                    .tickFormat(this.config.tickFormat)
            )

        this.x.selectAll('text').attr('font-size', this.config.tickFontSize)
    }

    setYAxis(scale) {
        this.y = this.axisGroup
            .append('g')
            .attr('class', `y-axis`)
            .call(
                d3
                    .axisLeft(scale)
                    .ticks(this.config.tickCount)
                    .tickSize(this.config.tickSize)
                    .tickFormat(this.config.tickFormat)
            )

        this.y.selectAll('text').attr('font-size', this.config.tickFontSize)
    }

    setXGrid() {
        this.x.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', 'grid')
                .attr('stroke', this.config.gridColor)
                .attr('pointer-events', 'none')
                .attr('y1', -this.plotHeight)
                .attr('y2', 0)
        )
    }

    setYGrid() {
        this.y.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', 'grid')
                .attr('stroke', this.config.gridColor)
                .attr('pointer-events', 'none')
                .attr('x1', 0)
                .attr('x2', this.plotWidth)
        )
    }

    setXLabel(label, margin, fontSize = 12) {
        this.x
            .append('g')
            .attr('font-size', fontSize)
            .attr(
                'transform',
                `translate(${this.plotWidth / 2}, ${margin - fontSize / 2})`
            )
            .append('text')
            .attr('class', 'axis-label')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text(label)
    }

    setYLabel(label, margin, fontSize = 12) {
        this.y
            .append('g')
            .attr('font-size', fontSize)
            .attr(
                'transform',
                `translate(${-margin + fontSize}, ${this.plotHeight / 2})`
            )
            .append('text')
            .attr('class', 'axis-label')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text(label)
    }

    updateXAxis(scale, transitionDuration = 0) {
        this.x
            .transition()
            .duration(transitionDuration)
            .call(
                d3
                    .axisBottom(scale)
                    .ticks(this.config.tickCount)
                    .tickSize(this.config.tickSize)
                    .tickFormat(this.config.tickFormat)
            )

        this.x
            .selectAll('text')
            .filter(function () {
                return !this.classList.contains('axis-label')
            })
            .attr('font-size', this.config.tickFontSize)
    }

    updateYAxis(scale, transitionDuration = 0) {
        this.y
            .transition()
            .duration(transitionDuration)
            .call(
                d3
                    .axisLeft(scale)
                    .ticks(this.config.tickCount)
                    .tickSize(this.config.tickSize)
                    .tickFormat(this.config.tickFormat)
            )

        this.y
            .selectAll('text')
            .filter(function () {
                return !this.classList.contains('axis-label')
            })
            .attr('font-size', this.config.tickFontSize)
    }

    removeXGrid() {
        this.x.call((g) => g.selectAll('.grid').remove())
    }

    removeYGrid() {
        this.y.call((g) => g.selectAll('.grid').remove())
    }
}

export default AxisManager
