import * as d3 from 'd3';

import BasePlot, { BasePlotProps, Scale } from '@/components/plots/common/base-plot';
import { BatchPointsPrimitive } from '@/components/plots/common/primitives/primitives';
interface ScatterPlotProps extends BasePlotProps {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
    pointSize?: number | ((d: Record<string, any>) => number);
    pointOpacity?: number | ((d: Record<string, any>) => number);
    colorByClass?: string | null;
}

interface ScatterPlotDomain {
    x: [number, number] | [Date, Date];
    y: [number, number] | [Date, Date];
    color: [number, number] | [Date, Date] | string[];
}

interface ScatterPlotScale extends Scale {
    color: d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
        | string
}

const DEFAULT_SCATTER_PLOT_CONFIG = {
    pointSize: 50,
    pointOpacity: 1,
    colorByClass: null,
};

class BaseScatterPlot extends BasePlot {

    dataPoints!: BatchPointsPrimitive;
    declare domain: ScatterPlotDomain;
    declare scale: ScatterPlotScale;
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
        } 

    }

    renderElements() {

        this.dataPoints = this.primitives.addPoints(
            this.props.data,
            d => d[this.props.xClass],
            d => d[this.props.yClass],
            {
                symbolType: d3.symbolCircle,
                fill: d => typeof this.scale.color === 'function' ? this.scale.color(d[this.props.colorByClass!]) 
                : this.scale.color,
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
        if (!this.props.colorByClass) return;

        this.legend.setTitle(this.config.legendConfig.title ?? this.props.colorByClass);

        if (typeof this.scale.color !== 'string') {
            this.legend.addLegend(this.scale.color, 'point', {
                symbolType: d3.symbolCircle,
            });
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
