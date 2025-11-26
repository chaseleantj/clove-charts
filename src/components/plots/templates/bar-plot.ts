import * as d3 from 'd3';
import BasePlot, {
    BasePlotProps,
    DataKey,
} from '@/components/plots/common/base-plot';
import { mergeWithDefaults } from '@/components/plots/common/template-config';

export interface BarPlotConfig {
    padding: number;
    useDifferentColors: boolean;
}

export interface BarPlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlotProps<TData>,
        Partial<BarPlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKey: DataKey<TData>;
}

interface BarPlotScale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
    color?: d3.ScaleOrdinal<string, string>;
}

interface BarPlotDomain {
    x: string[];
    y: [number, number];
}

export const DEFAULT_BAR_PLOT_CONFIG: BarPlotConfig = {
    padding: 0.2,
    useDifferentColors: true,
};

class BaseBarPlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    declare domain: BarPlotDomain;
    declare scale: BarPlotScale;
    declare props: BarPlotProps<TData>;

    barPlotConfig!: BarPlotConfig;

    constructor(props: BarPlotProps<TData>) {
        super(props);
    }

    onInitializeProperties(): void {
        this.barPlotConfig = mergeWithDefaults(
            DEFAULT_BAR_PLOT_CONFIG,
            this.props
        );
    }

    protected configureDomainAndScales(): void {
        const minValue = this.config.scaleConfig.logY ? 1 : 0;

        this.domain = {
            x: this.getDefaultDomainX() as string[],
            y: (this.config.domainConfig.domainY as [number, number]) ?? [
                minValue,
                this.getDefaultDomainY()[1],
            ],
        };

        const padding = this.props.padding ?? this.barPlotConfig.padding;

        this.scale = {
            x: d3
                .scaleBand()
                .domain(this.domain.x)
                .range([0, this.plotWidth])
                .paddingInner(padding)
                .paddingOuter(padding),
            y: this.getDefaultScaleY() as BarPlotScale['y'],
        };

        if (this.barPlotConfig.useDifferentColors) {
            const xValues = this.props.data.map(
                (d) => d[this.props.xKey]
            ) as string[];
            const categoryDomain = this.domainManager.getDomain(
                xValues
            ) as string[];
            this.scale.color = this.scaleManager.getColorScale(
                categoryDomain
            ) as d3.ScaleOrdinal<string, string>;
        }
    }

    draw() {
        const fillOption =
            typeof this.scale.color === 'function'
                ? (d: Record<string, any>) =>
                      (this.scale.color as (value: unknown) => string)(
                          d[this.props.xKey]
                      )
                : this.config.colorConfig.defaultColor;

        this.primitiveManager.addRectangles(
            this.props.data,
            (d: Record<string, any>) => this.scale.x(d[this.props.xKey]),
            (d: Record<string, any>) => this.scale.y(d[this.props.yKey]),
            (d: Record<string, any>) =>
                (this.scale.x(d[this.props.xKey]) as number) +
                this.scale.x.bandwidth(),
            () => this.scale.y(this.domain.y[0]),
            {
                opacity: this.config.themeConfig.opacity,
                fill: fillOption,
                coordinateSystem: 'pixel',
            }
        );
    }
}

export default BaseBarPlot;
