import * as d3 from 'd3';
import { AxisConfig } from '@/components/plots/common/config';

class AxisManager {
    x!: d3.Selection<SVGGElement, unknown, null, undefined>;
    y!: d3.Selection<SVGGElement, unknown, null, undefined>;
    axisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    constructor(
        private readonly plotArea: d3.Selection<
            SVGGElement,
            unknown,
            null,
            undefined
        >,
        private readonly plotWidth: number,
        private readonly plotHeight: number,
        private readonly axisConfig: Required<AxisConfig>
    ) {
        this.plotArea = plotArea;
        this.plotWidth = plotWidth;
        this.plotHeight = plotHeight;

        this.axisGroup = this.plotArea
            .append('g')
            .attr('class', 'axes')
            .attr('overflow', 'visible');
    }

    setXAxis(scale: d3.AxisScale<string>) {
        let xAxis: d3.Axis<string> = d3
            .axisBottom(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        if (this.axisConfig.tickFormat) {
            xAxis = xAxis.tickFormat(this.axisConfig.tickFormat);
        }

        this.x = this.axisGroup
            .append('g')
            .attr('transform', `translate(0, ${this.plotHeight})`)
            .attr('class', `x-axis`)
            .call(xAxis);

        this.x
            .selectAll('text')
            .attr('font-size', this.axisConfig.tickFontSize);
    }

    setYAxis(scale: d3.AxisScale<string>) {
        let yAxis: d3.Axis<string> = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        if (this.axisConfig.tickFormat) {
            yAxis = yAxis.tickFormat(this.axisConfig.tickFormat);
        }

        this.y = this.axisGroup.append('g').attr('class', `y-axis`).call(yAxis);

        this.y
            .selectAll('text')
            .attr('font-size', this.axisConfig.tickFontSize);
    }

    setXGrid() {
        this.x.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', 'grid')
                .attr('stroke', this.axisConfig.gridColor)
                .attr('pointer-events', 'none')
                .attr('y1', -this.plotHeight)
                .attr('y2', 0)
        );
    }

    setYGrid() {
        this.y.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', 'grid')
                .attr('stroke', this.axisConfig.gridColor)
                .attr('pointer-events', 'none')
                .attr('x1', 0)
                .attr('x2', this.plotWidth)
        );
    }

    setXLabel(label: string, margin: number, fontSize = 12) {
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
            .text(label);
    }

    setYLabel(label: string | null, margin: number, fontSize = 12) {
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
            .text(label);
    }

    updateXAxis(scale: d3.AxisScale<string>, transitionDuration = 0) {
        let xAxis = d3
            .axisBottom(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        if (this.axisConfig.tickFormat) {
            xAxis = xAxis.tickFormat(this.axisConfig.tickFormat);
        }

        this.x.transition().duration(transitionDuration).call(xAxis);

        this.x
            .selectAll('text')
            .filter(function () {
                return (
                    this instanceof Element &&
                    !this.classList.contains('axis-label')
                );
            })
            .attr('font-size', this.axisConfig.tickFontSize);
    }

    updateYAxis(scale: d3.AxisScale<string>, transitionDuration = 0) {
        let yAxis = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        if (this.axisConfig.tickFormat) {
            yAxis = yAxis.tickFormat(this.axisConfig.tickFormat);
        }

        this.y.transition().duration(transitionDuration).call(yAxis);

        this.y
            .selectAll('text')
            .filter(function () {
                return (
                    this instanceof Element &&
                    !this.classList.contains('axis-label')
                );
            })
            .attr('font-size', this.axisConfig.tickFontSize);
    }

    removeXGrid() {
        this.x.call((g) => g.selectAll('.grid').remove());
    }

    removeYGrid() {
        this.y.call((g) => g.selectAll('.grid').remove());
    }
}

export default AxisManager;
