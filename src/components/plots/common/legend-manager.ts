import * as d3 from 'd3';
import { CLOVE_CLASSES } from '@/components/plots/common/config/classes';
import { v4 as uuidv4 } from 'uuid';

import { LegendConfig } from '@/components/plots/common/config';
import { getDomainKind } from '@/components/plots/common/utils';

interface PointStyles {
    size?: number;
    symbolType?: d3.SymbolType;
    opacity?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

interface LineStyles {
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeDashArray?: string;
}

interface RectStyles {
    opacity?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

type StyleForType<T extends 'point' | 'line' | 'rect'> = T extends 'point'
    ? PointStyles
    : T extends 'line'
      ? LineStyles
      : T extends 'rect'
        ? RectStyles
        : never;

class LegendManager {
    container: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    gradientId: string;

    constructor(
        private readonly legendConfig: Required<LegendConfig>,
        containerNode: HTMLDivElement
    ) {
        this.container = d3.select(containerNode);
        this.gradientId = 'linear-gradient-' + uuidv4();

        // Apply absolute positioning from config
        if (this.legendConfig.absolutePositions) {
            Object.entries(this.legendConfig.absolutePositions).forEach(
                ([key, value]) => {
                    if (value) this.container.style(key, value);
                }
            );
        }

        // Apply max height if set
        if (this.legendConfig.maxHeight) {
            this.container.style(
                'max-height',
                `${this.legendConfig.maxHeight}px`
            );
        }
    }

    public setTitle(title?: string) {
        this.container.selectAll(`.${CLOVE_CLASSES.legendTitle}`).remove();
        const newTitle = title ?? this.legendConfig.title;

        if (newTitle) {
            this.container
                .insert('div', ':first-child')
                .attr('class', CLOVE_CLASSES.legendTitle)
                .text(newTitle);
        }
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

    public addCategoricalItem<T extends 'point' | 'line' | 'rect'>(
        type: T,
        label: string,
        itemStyles: StyleForType<T>
    ) {
        const row = this.container
            .append('div')
            .attr('class', CLOVE_CLASSES.legendItem);

        // Symbol container with small SVG
        const symbol = row
            .append('div')
            .attr('class', CLOVE_CLASSES.legendSymbol);

        const svg = symbol
            .append('svg')
            .attr('width', 14)
            .attr('height', 14)
            .style('overflow', 'visible');

        if (type === 'line') {
            const lineStyles = itemStyles as LineStyles;
            svg.append('line')
                .attr('x1', 0)
                .attr('y1', 7)
                .attr('x2', 14)
                .attr('y2', 7)
                .attr('stroke', lineStyles.stroke || 'currentColor')
                .attr('stroke-width', lineStyles.strokeWidth || 2)
                .attr('stroke-dasharray', lineStyles.strokeDashArray || '')
                .attr('opacity', lineStyles.opacity ?? 1);
        } else if (type === 'point') {
            const pointStyles = itemStyles as PointStyles;
            const symbolGenerator = d3
                .symbol()
                .type(pointStyles.symbolType || d3.symbolCircle)
                .size(pointStyles.size || 50);

            svg.append('path')
                .attr('d', symbolGenerator)
                .attr('transform', 'translate(7, 7)')
                .attr('fill', pointStyles.fill || 'currentColor')
                .attr('stroke', pointStyles.stroke || 'none')
                .attr('stroke-width', pointStyles.strokeWidth || 1)
                .attr('opacity', pointStyles.opacity ?? 1);
        } else if (type === 'rect') {
            const rectStyles = itemStyles as RectStyles;
            svg.append('rect')
                .attr('x', 1)
                .attr('y', 2)
                .attr('width', 12)
                .attr('height', 10)
                .attr('fill', rectStyles.fill || 'currentColor')
                .attr('stroke', rectStyles.stroke || 'none')
                .attr('stroke-width', rectStyles.strokeWidth || 1)
                .attr('opacity', rectStyles.opacity ?? 1);
        }

        row.append('span').text(label);
    }

    public addContinuousLegend(colorScale: d3.ScaleSequential<string, never>) {
        const wrapper = this.container
            .append('div')
            .style('text-align', 'left');

        const svg = wrapper.append('svg');

        const defs = svg.append('defs');
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

        svg.append('g')
            .append('rect')
            .attr('width', this.legendConfig.continuousBarWidth)
            .attr('height', this.legendConfig.continuousBarLength)
            .style('fill', `url(#${this.gradientId})`);

        const axisScale = d3
            .scaleLinear()
            .domain(colorScale.domain())
            .range([this.legendConfig.continuousBarLength, 0])
            .nice();

        const axisRight = (
            g: d3.Selection<SVGGElement, unknown, null, undefined>
        ) =>
            g
                .attr(
                    'transform',
                    `translate(${this.legendConfig.continuousBarWidth + 5}, 0)`
                )
                .call(d3.axisRight(axisScale).tickValues(axisScale.ticks(5)));

        svg.append('g').call(axisRight);

        // Set SVG dimensions based on content
        const bbox = svg.node()?.getBBox();
        if (bbox) {
            const w = Math.max(bbox.width, 1);
            const h = Math.max(this.legendConfig.continuousBarLength + 10, 1);
            svg.attr('viewBox', `${bbox.x} ${bbox.y} ${w} ${h}`)
                .attr('width', w)
                .attr('height', h)
                .style('overflow', 'visible');
        }
    }

    public clearLegend() {
        this.container.selectAll('*').remove();
    }
}

export default LegendManager;
