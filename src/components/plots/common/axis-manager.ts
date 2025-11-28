import * as d3 from 'd3';
import { AxisConfig } from '@/components/plots/common/config';
import { CLOVE_CLASSES } from '@/components/plots/common/config/classes';
import {
    isDateArray,
    isNumberArray,
    isStringArray,
} from '@/components/plots/common/utils/type-guards';

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
            .attr('class', CLOVE_CLASSES.axes)
            .attr('overflow', 'visible');
    }

    private getFormatter(
        scale: d3.AxisScale<string>
    ): ((domainValue: number | string | Date, index: number) => string) | null {
        const domain = scale.domain();

        if (isNumberArray(domain)) {
            return (d) => this.axisConfig.defaultNumberFormat(d as number);
        } else if (isStringArray(domain)) {
            return (d) => this.axisConfig.defaultStringFormat(d as string);
        } else if (isDateArray(domain)) {
            return null;
        }

        return null;
    }

    setXAxis(scale: d3.AxisScale<string>) {
        let xAxis: d3.Axis<string> = d3
            .axisBottom(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        const formatter =
            this.axisConfig.tickFormatX || this.getFormatter(scale);
        xAxis = formatter ? xAxis.tickFormat(formatter) : xAxis;

        this.x = this.axisGroup
            .append('g')
            .attr('transform', `translate(0, ${this.plotHeight})`)
            .attr('class', CLOVE_CLASSES.xAxis)
            .call(xAxis);
    }

    setYAxis(scale: d3.AxisScale<string>) {
        let yAxis: d3.Axis<string> = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        const formatter =
            this.axisConfig.tickFormatY || this.getFormatter(scale);
        yAxis = formatter ? yAxis.tickFormat(formatter) : yAxis;

        this.y = this.axisGroup
            .append('g')
            .attr('class', CLOVE_CLASSES.yAxis)
            .call(yAxis);
    }

    setXGrid() {
        this.x.call((g) =>
            g
                .selectAll('.tick > line')
                .filter((d, i, nodes) => i < nodes.length)
                .clone()
                .attr('class', CLOVE_CLASSES.grid)
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
                .attr('class', CLOVE_CLASSES.grid)
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
            .attr('class', CLOVE_CLASSES.axisLabel)
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
            .attr('class', CLOVE_CLASSES.axisLabel)
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

        const formatter =
            this.axisConfig.tickFormatX || this.getFormatter(scale);
        if (formatter) {
            xAxis = xAxis.tickFormat(formatter);
        }

        this.x.transition().duration(transitionDuration).call(xAxis);
    }

    updateYAxis(scale: d3.AxisScale<string>, transitionDuration = 0) {
        let yAxis = d3
            .axisLeft(scale)
            .ticks(this.axisConfig.tickCount)
            .tickSize(this.axisConfig.tickSize);

        const formatter =
            this.axisConfig.tickFormatY || this.getFormatter(scale);
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
