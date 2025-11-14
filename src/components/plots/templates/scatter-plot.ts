import * as d3 from 'd3';

import BasePlot, { BasePlotProps } from '@/components/plots/common/base';
import { BatchPointsPrimitive } from '@/components/plots/common/primitives/primitives';
import { getDomainKind } from '@/components/plots/common/type-guards';

interface ScatterPlotProps extends BasePlotProps {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
    pointSize?: number;
    pointOpacity?: number;
    colorByClass?: string | null;
}

const DEFAULT_SCATTER_PLOT_CONFIG = {
    pointSize: 50,
    pointOpacity: 1,
    colorByClass: null
}

interface ScatterPlotDomain {
    x: [number, number] | [Date, Date];
    y: [number, number] | [Date, Date];
    color: [number, number] | [Date, Date] | string[];
}

class BaseScatterPlot extends BasePlot {

    dataPoints!: BatchPointsPrimitive;
    declare domain: ScatterPlotDomain;
    declare props: ScatterPlotProps;

    constructor(props: ScatterPlotProps) {
        super(props);
    }

    shouldInitializeChart(): boolean {
        return this.props.data.length > 0;
    }

    onSetupScales() {
        if (this.props.colorByClass) {
            this.domain.color = this.domainManager.getDomain(
                (d) => d[this.props.colorByClass as string]
            );
            this.scale.color = this.scaleManager.getColorScale(this.domain.color);
        } else {
            this.scale.color = this.scaleManager.getColorScale();
        }
    }

    renderElements() {
        console.log('Sample data point:', this.props.data[0]);
        console.log('X value:', this.props.data[0]?.[this.props.xClass]);
        console.log('Y value:', this.props.data[0]?.[this.props.yClass]);

        const colorByClass = this.props.colorByClass 
            ? (d: Record<string, any>) => this.scale.color(d[this.props.colorByClass!]) 
            : this.config.colorConfig.defaultColor;

        this.dataPoints = this.primitives.addPoints(
            this.props.data,
            (d) => d[this.props.xClass],
            (d) => d[this.props.yClass],
            {
                symbolType: d3.symbolCircle,
                fill: colorByClass,
                size: this.props.pointSize ?? DEFAULT_SCATTER_PLOT_CONFIG.pointSize,
                opacity: this.props.pointOpacity ?? DEFAULT_SCATTER_PLOT_CONFIG.pointOpacity,
                layerName: 'points',
                className: 'data-point',
                pointerEvents: 'auto',
            }
        );

        if (this.config.tooltipConfig.tooltipRef.current) {
            this.drawTooltip();
        }
        this.onRenderComplete();
    }

    onSetupLegend() {
        if (!this.props.colorByClass) return;

        this.legend.setTitle(this.config.legendConfig.title ?? this.props.colorByClass);

        const domainKind = getDomainKind(this.domain.color);
        if (domainKind === 'string') {

            const colorScale = this.scale.color as d3.ScaleOrdinal<string, string, never>

            this.legend.addCategoricalLegend();
            const classes = colorScale.domain();
            classes.forEach((cls: string) => {
                this.legend.addCategoricalItem(
                    'circle',
                    colorScale(cls),
                    cls
                );
            });
        } else if (domainKind === 'number' || domainKind === 'date') {

            const colorScale = this.scale.color as d3.ScaleSequential<string, never>

            this.legend.addContinuousLegend(colorScale);
        }
    }

    drawTooltip() {

        const displayClasses = this.props.colorByClass
            ? [this.props.xClass, this.props.yClass, this.props.colorByClass]
            : [this.props.xClass, this.props.yClass];

        const tooltipDisplayClasses =
            this.config.tooltipConfig.tooltipClasses ?? displayClasses;

        const elementSelection = this.dataPoints.elementSelection as d3.Selection<SVGPathElement | SVGLineElement | SVGRectElement | SVGTextElement | SVGImageElement | SVGGElement, Record<string, any>, d3.BaseType, unknown>;

        elementSelection
            .on('mouseover', (event, d) => {
                if (!this.brushManager || !this.brushManager.brushing) {

                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(4 * (this.props.pointSize ?? DEFAULT_SCATTER_PLOT_CONFIG.pointSize));

                    d3.select(event.target)
                        .transition()
                        .duration(this.config.themeConfig.transitionDuration / 4)
                        .attr('d', symbolGenerator);

                    this.tooltipManager.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltipManager.positionTooltip(event);
                    this.tooltipManager.showTooltip();
                }
            })
            .on('mouseout', (event) => {
                if (!this.brushManager || !this.brushManager.brushing) {
                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(this.props.pointSize ?? DEFAULT_SCATTER_PLOT_CONFIG.pointSize);

                    d3.select(event.target)
                        .transition()
                        .duration(this.config.themeConfig.transitionDuration / 4)
                        .attr('d', symbolGenerator);
                    this.tooltipManager.hideTooltip();
                }
            });

        this.interactionSurface.on('click', () => this.tooltipManager.hideTooltip());
    }
}

export default BaseScatterPlot;
