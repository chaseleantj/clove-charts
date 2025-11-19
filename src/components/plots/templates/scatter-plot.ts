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
            (d) => d[this.props.xClass],
            (d) => d[this.props.yClass],
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

        if (this.config.tooltipConfig.tooltipRef.current) {
            this.drawTooltip();
        }
    }

    onSetupLegend() {
        if (!this.props.colorByClass) return;

        this.legend.setTitle(
            this.config.legendConfig.title ?? this.props.colorByClass
        );

        const domainKind = getDomainKind(this.domain.color);
        if (domainKind === 'string') {
            const colorScale = this.scale.color as d3.ScaleOrdinal<
                string,
                string,
                never
            >;

            this.legend.addCategoricalLegend();
            const classes = colorScale.domain();
            classes.forEach((cls: string) => {
                this.legend.addCategoricalItem('point', cls, {
                    symbolType: d3.symbolCircle,
                    fill: colorScale(cls),
                });
            });
        } else if (domainKind === 'number' || domainKind === 'date') {
            const colorScale = this.scale.color as d3.ScaleSequential<
                string,
                never
            >;

            this.legend.addContinuousLegend(colorScale);
        }
    }

    drawTooltip() {
        const displayClasses = this.props.colorByClass
            ? [this.props.xClass, this.props.yClass, this.props.colorByClass]
            : [this.props.xClass, this.props.yClass];

        const tooltipDisplayClasses =
            this.config.tooltipConfig.tooltipClasses ?? displayClasses;

        this.dataPoints
            .attachEvent('mouseover', (event, d) => {
                if (!this.brushManager || !this.brushManager.brushing) {
                    const basePointSize = this.resolvePointSize(d);
                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(4 * basePointSize);

                    d3.select(event.currentTarget as SVGPathElement)
                        .transition()
                        .duration(
                            this.config.themeConfig.transitionDuration / 4
                        )
                        .attr('d', symbolGenerator);

                    this.tooltipManager.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltipManager.positionTooltip(event);
                    this.tooltipManager.showTooltip();
                }
            })
            .attachEvent('mouseout', (event, d) => {
                if (!this.brushManager || !this.brushManager.brushing) {
                    const basePointSize = this.resolvePointSize(d);
                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(basePointSize);

                    d3.select(event.currentTarget as SVGPathElement)
                        .transition()
                        .duration(
                            this.config.themeConfig.transitionDuration / 4
                        )
                        .attr('d', symbolGenerator);
                    this.tooltipManager.hideTooltip();
                }
            });

        this.interactionSurface.on('click', () =>
            this.tooltipManager.hideTooltip()
        );
    }

    private resolvePointSize(d?: Record<string, any>): number {
        const defaultSize = DEFAULT_SCATTER_PLOT_CONFIG.pointSize;
        const { pointSize } = this.props;

        if (typeof pointSize === 'function') {
            if (!d) return defaultSize;
            const value = pointSize(d);
            return typeof value === 'number' && Number.isFinite(value)
                ? value
                : defaultSize;
        }

        if (typeof pointSize === 'number' && Number.isFinite(pointSize)) {
            return pointSize;
        }

        return defaultSize;
    }
}

export default BaseScatterPlot;
