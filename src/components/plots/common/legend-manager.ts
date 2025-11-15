import * as d3 from 'd3';
import styles from '@/components/charts/page.module.css';
import { v4 as uuidv4 } from 'uuid';

import { LegendConfig } from '@/components/plots/common/config';

interface CategoricalItems {
    shape: string;
    color: string;
    text: string;
}

class LegendManager {
    legend: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    gradientId: string;
    categoricalItems: CategoricalItems[];

    legendGroup: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    continuousContainer!: d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    >;
    categoricalContainer!: d3.Selection<
        HTMLDivElement,
        unknown,
        null,
        undefined
    >;

    continuousSvg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    categoricalSvg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    categoricalGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

    constructor(private readonly legendConfig: Required<LegendConfig>) {
        this.legend = d3.select(this.legendConfig.legendRef.current!);
        this.gradientId = 'linear-gradient-' + uuidv4();
        this.categoricalItems = [];

        // Set CSS absolute position top/bottom/left/right
        for (const [key, value] of Object.entries(
            this.legendConfig.absolutePositions
        )) {
            this.legend.style(key, value);
        }

        this.legendGroup = this.legend
            .append('div')
            .attr('class', styles.legendGroup);
    }

    public setTitle(title?: string) {
        this.legendGroup.selectAll(`.${styles.legendTitle}`).remove();

        const newTitle = title ?? this.legendConfig.title;
        this.legendGroup
            .append('text')
            .style('font-size', this.legendConfig.titleFontSize + 'px')
            .style('margin-bottom', '5px')
            .html(newTitle);
    }

    public addContinuousLegend(colorScale: d3.ScaleSequential<string, never>) {
        this.continuousContainer = this.legendGroup
            .append('div')
            .style('text-align', 'right');
        this.continuousSvg = this.continuousContainer.append('svg');

        const defs = this.continuousSvg.append('defs');
        const linearGradient = defs
            .append('linearGradient')
            .attr('id', this.gradientId)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 1)
            .attr('y2', 0);

        linearGradient
            .selectAll('stop')
            .data(
                [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => ({
                    offset: `${t * 100}%`,
                    color: colorScale(
                        colorScale.domain()[0] +
                            t *
                                (colorScale.domain()[1] -
                                    colorScale.domain()[0])
                    ),
                }))
            )
            .enter()
            .append('stop')
            .attr('offset', (d) => d.offset)
            .attr('stop-color', (d) => d.color);

        this.continuousSvg
            .append('g')
            .append('rect')
            .attr('width', this.legendConfig.continuousBarWidth)
            .attr('height', this.legendConfig.continuousBarLength)
            .style('fill', `url(#${this.gradientId})`);

        const axisScale = d3
            .scaleLinear()
            .domain(colorScale.domain())
            .range([this.legendConfig.continuousBarLength, 0]);

        const axisRight = (
            g: d3.Selection<SVGGElement, unknown, null, undefined>
        ) =>
            g
                .attr('class', `y-axis`)
                .attr(
                    'transform',
                    `translate(${this.legendConfig.continuousBarWidth + 5}, 0)`
                )
                .call(d3.axisRight(axisScale).ticks(5));

        this.continuousSvg.append('g').call(axisRight);

        this.setLegendDimensions(
            this.continuousSvg,
            this.continuousContainer,
            this.legendConfig.continuousBarLength
        );
    }

    public addCategoricalLegend() {
        this.categoricalContainer = this.legendGroup
            .append('div')
            .style('text-align', 'right');
        this.categoricalSvg = this.categoricalContainer.append('svg');
        this.categoricalGroup = this.categoricalSvg.append('g');
    }

    public addCategoricalItem(shape: string, color: string, text: string) {
        const item = { shape, color, text };
        this.categoricalItems.push(item);
        this.renderCategoricalLegend();
    }

    public renderCategoricalLegend() {
        this.categoricalGroup.selectAll('*').remove();

        // Map shape names to d3 symbol types
        const getSymbolType = (shape: string) => {
            switch (shape) {
                case 'circle':
                    return d3.symbolCircle;
                case 'square':
                    return d3.symbolSquare;
                case 'triangle':
                    return d3.symbolTriangle;
                case 'diamond':
                    return d3.symbolDiamond;
                case 'star':
                    return d3.symbolStar;
                case 'cross':
                    return d3.symbolCross;
                default:
                    return d3.symbolCircle;
            }
        };

        // Render symbols using d3.symbol
        this.categoricalGroup
            .selectAll('.legend-symbols')
            .data(this.categoricalItems)
            .enter()
            .each((d, i) => {
                const y =
                    i * this.legendConfig.categoricalItemHeight +
                    this.legendConfig.categoricalItemHeight / 2;
                const group = this.categoricalGroup.append('g');

                if (d.shape === 'line') {
                    // Keep line as is since d3.symbol doesn't have a line type
                    group
                        .append('line')
                        .attr('x1', 2)
                        .attr('x2', 18)
                        .attr('y1', y)
                        .attr('y2', y)
                        .attr('stroke', d.color)
                        .attr('stroke-width', 3);
                } else {
                    // Use d3.symbol for other shapes
                    const symbolType = getSymbolType(d.shape);
                    const symbolGenerator = d3
                        .symbol()
                        .type(symbolType)
                        .size(64);

                    group
                        .append('path')
                        .attr('d', symbolGenerator)
                        .attr('transform', `translate(10, ${y})`)
                        .style('fill', d.color);
                }
            });

        this.categoricalGroup
            .selectAll('.legend-labels')
            .data(this.categoricalItems)
            .enter()
            .append('text')
            .text((d) => d.text)
            .attr('x', 25)
            .attr(
                'y',
                (d, i) =>
                    i * this.legendConfig.categoricalItemHeight +
                    this.legendConfig.categoricalItemHeight / 2
            )
            .attr('font-size', this.legendConfig.fontSize)
            .attr('fill', 'currentColor')
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'start');

        this.setLegendDimensions(
            this.categoricalSvg,
            this.categoricalContainer,
            this.categoricalItems.length *
                this.legendConfig.categoricalItemHeight
        );
    }

    public clearCategoricalLegend() {
        this.categoricalItems = [];
        if (this.categoricalGroup) {
            this.categoricalGroup.selectAll('*').remove();
            this.setLegendDimensions(
                this.categoricalSvg,
                this.categoricalContainer,
                0
            );
        }
    }

    private setLegendDimensions(
        legendSvg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        container: d3.Selection<HTMLDivElement, unknown, null, undefined>,
        contentHeight: number
    ) {
        // Calculate the bounding box of everything drawn
        const bbox = legendSvg.node()?.getBBox();

        if (!bbox) return;

        const w = Math.max(bbox.width, 1);
        const h = Math.max(contentHeight + 10 || bbox.height, 1);

        // Use a tight viewBox but keep fixed pixel width/height so it doesn't expand
        legendSvg
            .attr('viewBox', `${bbox.x} ${bbox.y} ${w} ${h}`)
            .attr('preserveAspectRatio', 'none')
            .attr('width', w)
            .attr('height', h)
            .style('overflow', 'visible');

        // Make the legend scrollable if it's too tall
        if (
            this.legendConfig.maxHeight &&
            contentHeight &&
            contentHeight > this.legendConfig.maxHeight
        ) {
            container
                .style('max-height', `${this.legendConfig.maxHeight}px`)
                .style('overflow-y', 'auto');
        }
    }
}

export default LegendManager;
