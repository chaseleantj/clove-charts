import * as d3 from 'd3';

import BasePlot, { BasePlotProps, Scale } from '@/components/plots/common/base-plot';
import { RequiredPlotConfig } from '@/components/plots/common/config';
import { BatchPointsPrimitive } from '@/components/plots/common/primitives/primitives';
import { isContinuousScale, D3Scale } from '@/components/plots/common/scale-manager';

export interface ScatterPlotConfig {
    pointSize: number | ((d: Record<string, any>) => number);
    pointOpacity: number | ((d: Record<string, any>) => number);
    colorByClass: string | null;
}

export interface ScatterPlotProps extends BasePlotProps, Partial<ScatterPlotConfig> {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
}

interface ScatterPlotDomain {
    x: [number, number] | [Date, Date] | string[];
    y: [number, number] | [Date, Date] | string[];
    color: [number, number] | [Date, Date] | string[];
}

interface ScatterPlotScale extends Scale {
    color: d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
        | string
}

export const DEFAULT_SCATTER_PLOT_CONFIG: Partial<ScatterPlotConfig> = {
    pointSize: 50,
    colorByClass: null,
};

export function getScatterPlotConfig(
    props: ScatterPlotProps,
    themeConfig: RequiredPlotConfig['themeConfig']
): ScatterPlotConfig {
    return {
        pointSize: props.pointSize ?? DEFAULT_SCATTER_PLOT_CONFIG.pointSize!,
        colorByClass: props.colorByClass ?? DEFAULT_SCATTER_PLOT_CONFIG.colorByClass!,
        pointOpacity: props.pointOpacity ?? themeConfig.opacity,
    };
}

class BaseScatterPlot extends BasePlot {

    dataPoints!: BatchPointsPrimitive;
    declare domain: ScatterPlotDomain;
    declare scale: ScatterPlotScale;
    declare props: ScatterPlotProps;
    
    scatterPlotConfig!: ScatterPlotConfig;

    constructor(props: ScatterPlotProps) {
        super(props);
        this.scatterPlotConfig = getScatterPlotConfig(props, this.config.themeConfig);
    }

    shouldInitializeChart(): boolean {
        return this.props.data.length > 0;
    }

    onSetupScales() {
        if (this.scatterPlotConfig.colorByClass) {
            this.domain.color = this.domainManager.getDomain(
                (d) => d[this.scatterPlotConfig.colorByClass as string]
            );
            this.scale.color = this.scaleManager.getColorScale(
                this.domain.color
            );
        } 
    }

    private getCoordinateAccessor(key: string, scale: D3Scale) {
        if (isContinuousScale(scale)) {
            return (d: Record<string, any>) => d[key];
        }

        return (d: Record<string, any>) => {
            const val = d[key];
            const bandScale = scale as d3.ScaleBand<string>;
            const scaled = bandScale(val);

            if (scaled === undefined) return null;
            // Center the point in the band
            return scaled + bandScale.bandwidth() / 2;
        };
    }

    renderElements() {
        this.dataPoints = this.primitives.addPoints(
            this.props.data,
            this.getCoordinateAccessor(this.props.xClass, this.scale.x),
            this.getCoordinateAccessor(this.props.yClass, this.scale.y),
            {
                symbolType: d3.symbolCircle,
                fill: d => typeof this.scale.color === 'function' ? this.scale.color(d[this.scatterPlotConfig.colorByClass!]) 
                : this.scale.color,
                size: this.scatterPlotConfig.pointSize,
                opacity: this.scatterPlotConfig.pointOpacity
            }
        );
    }

    onSetupLegend() {
        if (!this.scatterPlotConfig.colorByClass) return;

        this.legend.setTitle(this.config.legendConfig.title ?? this.scatterPlotConfig.colorByClass);

        if (typeof this.scale.color !== 'string') {
            this.legend.addLegend(this.scale.color, 'point', {
                symbolType: d3.symbolCircle,
            });
        }
    }

    drawTooltip() {
        const displayClasses = this.scatterPlotConfig.colorByClass
            ? [this.props.xClass, this.props.yClass, this.scatterPlotConfig.colorByClass]
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
