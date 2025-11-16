import * as d3 from 'd3';
import { AxisConfig } from '@/components/plots/common/config';
import styles from '@/components/page.module.css';

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
            .attr('class', styles.axes)
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
            .attr('class', styles.xAxis)
            .call(xAxis);

    }

    setYAxis(scale: d3.AxisScale<string>) {
        let yAxis: d3.Axis<string> = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        if (this.axisConfig.tickFormat) {
            yAxis = yAxis.tickFormat(this.axisConfig.tickFormat);
        }

        this.y = this.axisGroup.append('g').attr('class', styles.yAxis).call(yAxis);

    }

    setXGrid() {
        this.x.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', styles.grid)
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
                .attr('class', styles.grid)
                .attr('pointer-events', 'none')
                .attr('x1', 0)
                .attr('x2', this.plotWidth)
        );
    }

    setXLabel(label: string | null, margin: number) {
        this.x
            .append('g')
            .attr(
                'transform',
                `translate(${this.plotWidth / 2}, ${margin - this.axisConfig.labelOffsetX})`
            )
            .attr('class', styles.axisLabel)
            .append('text')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text(label);
    }

    setYLabel(label: string | null, margin: number) {
        this.y
            .append('g')
            .attr(
                'transform',
                `translate(${-margin + this.axisConfig.labelOffsetY}, ${this.plotHeight / 2})`
            )
            .attr('class', styles.axisLabel)
            .append('text')
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
    }

    removeXGrid() {
        this.x.call((g) => g.selectAll(`.${styles.grid}`).remove());
    }

    removeYGrid() {
        this.y.call((g) => g.selectAll(`.${styles.grid}`).remove());
    }
}

export default AxisManager;
