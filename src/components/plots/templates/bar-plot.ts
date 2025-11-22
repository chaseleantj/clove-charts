import * as d3 from 'd3';
import BasePlot, { BasePlotProps } from '@/components/plots/common/base-plot';

export interface BarPlotConfig {
    padding: number;
    useDifferentColors: boolean;
}

export interface BarPlotProps extends BasePlotProps, Partial<BarPlotConfig> {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
}

interface BarPlotScale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleLinear<number, number>;
}

interface BarPlotDomain {
    x: string[];
    y: [number, number];
}

const DEFAULT_BAR_PLOT_CONFIG: BarPlotConfig = {
    padding: 0.2,
    useDifferentColors: true,
};

class BaseBarPlot extends BasePlot {
    declare domain: BarPlotDomain;
    declare scale: BarPlotScale;
    declare props: BarPlotProps;

    barPlotConfig!: BarPlotConfig;

    constructor(props: BarPlotProps) {
        super(props);
        this.barPlotConfig = {
            padding: this.props.padding ?? DEFAULT_BAR_PLOT_CONFIG.padding,
            useDifferentColors:
                this.props.useDifferentColors ??
                DEFAULT_BAR_PLOT_CONFIG.useDifferentColors,
        };
    }

    onSetupDomain() {
        const minValue = this.config.scaleConfig.logY ? 1 : 0;

        this.domain = {
            ...this.domain,
            y: this.config.domainConfig.domainY ?? [minValue, this.domain.y[1]],
        };
    }

    onSetupScales() {
        const padding = this.props.padding ?? DEFAULT_BAR_PLOT_CONFIG.padding;

        this.scale.x = d3
            .scaleBand()
            .domain(this.domain.x)
            .range([0, this.plotWidth])
            .paddingInner(padding)
            .paddingOuter(padding);
    }

    renderElements() {
        const color = this.barPlotConfig.useDifferentColors
            ? this.scaleManager.getColorScale(
                  this.domainManager.getDomain((d) => d[this.props.xClass])
              )
            : this.config.colorConfig.defaultColor;

        let x1Accessor, y1Accessor, x2Accessor, y2Accessor;

        x1Accessor = (d: Record<string, any>) =>
            this.scale.x(d[this.props.xClass]);
        y1Accessor = (d: Record<string, any>) =>
            this.scale.y(d[this.props.yClass]);
        x2Accessor = (d: Record<string, any>) =>
            (this.scale.x(d[this.props.xClass]) as number) +
            this.scale.x.bandwidth();
        y2Accessor = () => this.scale.y(this.domain.y[0]);

        this.primitives.addRectangles(
            this.props.data,
            x1Accessor,
            y1Accessor,
            x2Accessor,
            y2Accessor,
            {
                opacity: this.config.themeConfig.opacity,
                fill:
                    typeof color === 'function'
                        ? (d) => color(d[this.props.xClass])
                        : color,
                coordinateSystem: 'pixel',
            }
        );
    }
}

export default BaseBarPlot;
