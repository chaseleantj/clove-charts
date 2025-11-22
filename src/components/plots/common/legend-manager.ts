import * as d3 from 'd3';
import styles from '@/components/page.module.css';
import { v4 as uuidv4 } from 'uuid';

import { LegendConfig } from '@/components/plots/common/config';
import { getDomainKind } from '@/components/plots/common/type-guards';

interface PointStyles extends CommonCategoricalStyles {
    size?: number;
    symbolType?: d3.SymbolType;
}
interface LineStyles extends CommonCategoricalStyles {}
interface RectStyles extends CommonCategoricalStyles {}

interface CommonCategoricalStyles {
    opacity?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDashArray?: string;
}

// Map type T to the corresponding styles interface
type StyleForType<T extends 'point' | 'line' | 'rect'> = 
    T extends 'point' ? PointStyles
    : T extends 'line' ? LineStyles
    : T extends 'rect' ? RectStyles
    : never;

interface CategoricalItem<T extends 'point' | 'line' | 'rect'> {
    type: T;
    label: string;
    styles: StyleForType<T>;
}

class LegendManager {
    legend: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    gradientId: string;
    categoricalItems: CategoricalItem<any>[];

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
            .attr('class', styles.legendTitle)
            .html(newTitle);
    }

    public addLegend<T extends 'point' | 'line' | 'rect'>(
        scale:
            | d3.ScaleOrdinal<string, string>
            | d3.ScaleSequential<string, never>,
        type: T,
        options: StyleForType<T> = {} as StyleForType<T>
    ) {
        const domain = scale.domain();
        const domainKind = getDomainKind(domain as any);

        if (domainKind === 'string') {
            this.addCategoricalLegend();
            const ordinalScale = scale as d3.ScaleOrdinal<string, string>;
            ordinalScale.domain().forEach((cls) => {
                const color = ordinalScale(cls);
                const itemStyles = { ...options } as any;

                if (type === 'line') {
                    if (!itemStyles.stroke) itemStyles.stroke = color;
                } else {
                    if (!itemStyles.fill) itemStyles.fill = color;
                }

                this.addCategoricalItem(type, cls, itemStyles);
            });
        } else if (domainKind === 'number' || domainKind === 'date') {
            this.addContinuousLegend(
                scale as d3.ScaleSequential<string, never>
            );
        }
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
                .call(d3.axisRight(axisScale).tickValues(axisScale.ticks(5).concat(axisScale.domain()))); // ensures that the edges of the domain (first and last tick) are included

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

    public addCategoricalItem<T extends 'point' | 'line' | 'rect'>(
        type: T,
        label: string,
        styles: StyleForType<T>
    ) {
        this.categoricalItems.push({ type, label, styles });
        this.renderCategoricalLegend();
    }

    public renderCategoricalLegend() {
        this.categoricalGroup.selectAll('*').remove();

        // Render symbols
        this.categoricalGroup
            .selectAll('.legend-symbols')
            .data(this.categoricalItems)
            .enter()
            .each((d, i) => {
                const y =
                    i * this.legendConfig.categoricalItemHeight +
                    this.legendConfig.categoricalItemHeight / 2;
                const group = this.categoricalGroup.append('g');

                const commonStyles = d.styles as CommonCategoricalStyles;
                const pointStyles = d.styles as PointStyles;
                const lineStyles = d.styles as LineStyles;

                if (d.type === 'line') {
                    group
                        .append('line')
                        .attr('x1', 2)
                        .attr('x2', 18)
                        .attr('y1', y)
                        .attr('y2', y)
                        .attr('stroke', commonStyles.stroke || 'currentColor')
                        .attr('stroke-width', lineStyles.strokeWidth || 1.5)
                        .attr('stroke-dasharray', lineStyles.strokeDashArray || '')
                        .attr('opacity', commonStyles.opacity ?? 1);
                } else if (d.type === 'point') {
                    const symbolGenerator = d3
                        .symbol()
                        .type(pointStyles.symbolType || d3.symbolCircle)
                        .size(pointStyles.size || 64);

                    group
                        .append('path')
                        .attr('d', symbolGenerator)
                        .attr('transform', `translate(10, ${y})`)
                        .attr('fill', commonStyles.fill || 'currentColor')
                        .attr('stroke', commonStyles.stroke || 'none')
                        .attr('stroke-width', commonStyles.strokeWidth || 1)
                        .attr('opacity', commonStyles.opacity ?? 1);
                } else if (d.type === 'rect') {
                    group
                        .append('rect')
                        .attr('x', 2)
                        .attr('y', y - 6)
                        .attr('width', 16)
                        .attr('height', 12)
                        .attr('fill', commonStyles.fill || 'currentColor')
                        .attr('stroke', commonStyles.stroke || 'none')
                        .attr('stroke-width', commonStyles.strokeWidth || 1)
                        .attr('opacity', commonStyles.opacity ?? 1);
                }
            });

        this.categoricalGroup
            .selectAll('.legend-labels')
            .data(this.categoricalItems)
            .enter()
            .append('text')
            .text((d) => d.label)
            .attr('x', 25)
            .attr(
                'y',
                (d, i) =>
                    i * this.legendConfig.categoricalItemHeight +
                    this.legendConfig.categoricalItemHeight / 2
            )
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
