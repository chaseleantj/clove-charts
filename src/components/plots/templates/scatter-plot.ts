import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    DataKey,
    Scale,
} from '@/components/plots/common/base-plot';
import { RequiredPlotConfig } from '@/components/plots/common/config';
import { BatchPointsPrimitive } from '@/components/plots/common/primitives/primitives';
import {
    isContinuousScale,
    D3Scale,
} from '@/components/plots/common/scale-manager';

export interface ScatterPlotConfig<
    TData extends Record<string, any> = Record<string, any>,
> {
    pointSize: number | ((d: TData) => number);
    pointOpacity: number | ((d: TData) => number);
    colorByClass: DataKey<TData> | null;
    symbolType: d3.SymbolType;
}

export interface ScatterPlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlotProps<TData>,
        Partial<ScatterPlotConfig<TData>> {
    data: TData[];
    xClass: DataKey<TData>;
    yClass: DataKey<TData>;
}

interface ScatterPlotDomain {
    x: [number, number] | [Date, Date] | string[];
    y: [number, number] | [Date, Date] | string[];
    color?: [number, number] | [Date, Date] | string[];
}

interface ScatterPlotScale extends Scale {
    color?:
        | d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
}

export const DEFAULT_SCATTER_PLOT_CONFIG: Omit<ScatterPlotConfig, "pointOpacity" | "colorByClass"> = {
    pointSize: 50,
    symbolType: d3.symbolCircle
};

export function getScatterPlotConfig<TData extends Record<string, any>>(
    props: ScatterPlotProps<TData>,
    themeConfig: RequiredPlotConfig['themeConfig']
): ScatterPlotConfig<TData> {
    return {
        pointSize: props.pointSize ?? DEFAULT_SCATTER_PLOT_CONFIG.pointSize,
        colorByClass: props.colorByClass ?? null,
        pointOpacity: props.pointOpacity ?? themeConfig.opacity,
        symbolType: props.symbolType ?? DEFAULT_SCATTER_PLOT_CONFIG.symbolType
    };
}

class BaseScatterPlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    dataPoints!: BatchPointsPrimitive;
    declare domain: ScatterPlotDomain;
    declare scale: ScatterPlotScale;
    declare props: ScatterPlotProps<TData>;

    scatterPlotConfig!: ScatterPlotConfig<TData>;

    constructor(props: ScatterPlotProps<TData>) {
        super(props);
    }

    shouldInitializeChart(): boolean {
        return this.props.data.length > 0;
    }

    onInitializeProperties(): void {
        this.scatterPlotConfig = getScatterPlotConfig(
            this.props,
            this.config.themeConfig
        );
    }

    protected configureDomainAndScales(): void {
        this.domain = this.getDefaultDomain();
        this.scale = this.getDefaultScales();

        const colorKey = this.scatterPlotConfig.colorByClass;
        if (colorKey) {
            const colorValues = this.props.data.map((d) => d[colorKey]);
            this.domain.color = this.domainManager.getDomain(colorValues);
            this.scale.color = this.scaleManager.getColorScale(
                this.domain.color
            );
        }
    }

    private getCoordinateAccessor(key: DataKey<TData>, scale: D3Scale) {
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

    draw() {
        const { pointSize, pointOpacity, colorByClass } =
            this.scatterPlotConfig;

        const sizeOption =
            typeof pointSize === 'function'
                ? (d: Record<string, any>) => pointSize(d as TData)
                : pointSize;

        const opacityOption =
            typeof pointOpacity === 'function'
                ? (d: Record<string, any>) => pointOpacity(d as TData)
                : pointOpacity;

        const fillOption =
            typeof this.scale.color === 'function' && colorByClass
                ? (d: Record<string, any>) =>
                      (this.scale.color as
                          | d3.ScaleSequential<string, never>
                          | d3.ScaleOrdinal<string, string>)(
                          d[colorByClass]
                      )
                : this.config.colorConfig.defaultColor;

        this.dataPoints = this.primitiveManager.addPoints(
            this.props.data,
            this.getCoordinateAccessor(this.props.xClass, this.scale.x),
            this.getCoordinateAccessor(this.props.yClass, this.scale.y),
            {
                symbolType: d3.symbolCircle,
                fill: fillOption,
                size: sizeOption,
                opacity: opacityOption,
            }
        );
    }

    drawLegend() {
        if (!this.scatterPlotConfig.colorByClass) return;

        this.legendManager.setTitle(
            this.config.legendConfig.title ??
                this.scatterPlotConfig.colorByClass
        );

        if (this.scale.color) {
            this.legendManager.addLegend(this.scale.color, 'point', {
                symbolType: d3.symbolCircle,
            });
        }
    }

    drawTooltip() {
        const displayClasses = this.scatterPlotConfig.colorByClass
            ? [
                  this.props.xClass,
                  this.props.yClass,
                  this.scatterPlotConfig.colorByClass,
              ]
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
