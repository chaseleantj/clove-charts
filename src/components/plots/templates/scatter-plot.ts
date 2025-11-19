import * as d3 from 'd3';

import BasePlot, { BasePlotProps } from '@/components/plots/common/base-plot';
import { BatchPointsPrimitive } from '@/components/plots/common/primitives/primitives';
import { getDomainKind } from '@/components/plots/common/type-guards';

interface ScatterPlotProps extends BasePlotProps {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
    pointSize?: number | ((d: Record<string, any>) => number);
    pointOpacity?: number | ((d: Record<string, any>) => number);
    colorByClass?: string | null;
}

const DEFAULT_SCATTER_PLOT_CONFIG = {
    pointSize: 50,
    pointOpacity: 1,
    colorByClass: null,
};

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
            this.scale.color = this.scaleManager.getColorScale(
                this.domain.color
            );
        } else {
            this.scale.color = this.scaleManager.getColorScale();
        }
    }

    renderElements() {

        const colorByClass = this.props.colorByClass
            ? (d: Record<string, any>) =>
                  this.scale.color(d[this.props.colorByClass!])
            : this.config.colorConfig.defaultColor;

        this.dataPoints = this.primitives.addPoints(
            this.props.data,
            d => d[this.props.xClass],
            d => d[this.props.yClass],
            {
                symbolType: d3.symbolCircle,
                fill: colorByClass,
                size:
                    this.props.pointSize ??
                    DEFAULT_SCATTER_PLOT_CONFIG.pointSize,
                opacity:
                    this.props.pointOpacity ??
                    DEFAULT_SCATTER_PLOT_CONFIG.pointOpacity,
            }
        );

    }

    onSetupLegend() {
        const { colorByClass } = this.props;
        if (!colorByClass) return;

        this.legend.setTitle(this.config.legendConfig.title ?? colorByClass);

        const domainKind = getDomainKind(this.domain.color);
        const colorScale = this.scale.color;

        if (domainKind === 'string') {
            this.legend.addCategoricalLegend();
            const scale = colorScale as d3.ScaleOrdinal<string, string>;
            scale.domain().forEach((cls) => {
                this.legend.addCategoricalItem('point', cls, {
                    symbolType: d3.symbolCircle,
                    fill: scale(cls),
                });
            });
        } else if (domainKind === 'number' || domainKind === 'date') {
            this.legend.addContinuousLegend(
                colorScale as d3.ScaleSequential<string, never>
            );
        }
    }

    drawTooltip() {
        const displayClasses = this.props.colorByClass
            ? [this.props.xClass, this.props.yClass, this.props.colorByClass]
            : [this.props.xClass, this.props.yClass];

        const tooltipDisplayClasses =
            this.config.tooltipConfig.tooltipClasses ?? displayClasses;

        const getPointSize = (d: Record<string, any>) => {
            const { size } = this.dataPoints.options;
            return typeof size === 'number' ? size : size(d);
        };

        const animatePoint = (
            target: SVGPathElement,
            sizeMultiplier: number,
            d: Record<string, any>
        ) => {
            const size = getPointSize(d) * sizeMultiplier;
            const symbolGenerator = d3
                .symbol()
                .type(d3.symbolCircle)
                .size(size);

            d3.select(target)
                .transition()
                .duration(this.config.themeConfig.transitionDuration / 4)
                .attr('d', symbolGenerator);
        };

        this.dataPoints
            .attachEvent('mouseover', (event, d) => {
                if (!this.brushManager || !this.brushManager.brushing) {
                    animatePoint(event.currentTarget as SVGPathElement, 4, d);
                    this.tooltipManager.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltipManager.positionTooltip(event);
                    this.tooltipManager.showTooltip();
                }
            })
            .attachEvent('mouseout', (event, d) => {
                if (!this.brushManager || !this.brushManager.brushing) {
                    animatePoint(event.currentTarget as SVGPathElement, 1, d);
                    this.tooltipManager.hideTooltip();
                }
            });

        this.interactionSurface.on('click', () =>
            this.tooltipManager.hideTooltip()
        );
    }
}

export default BaseScatterPlot;
