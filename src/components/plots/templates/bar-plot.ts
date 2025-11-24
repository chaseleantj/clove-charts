import * as d3 from 'd3';
import BasePlot, {
    BasePlotProps,
    DataKey,
    DataRecord,
} from '@/components/plots/common/base-plot';

export interface BarPlotConfig {
    padding: number;
    useDifferentColors: boolean;
}

export interface BarPlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlotProps<TData>,
        Partial<BarPlotConfig> {
    data: TData[];
    xClass: DataKey<TData>;
    yClass: DataKey<TData>;
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

export function getBarPlotConfig<TData extends Record<string, any>>(
    props: BarPlotProps<TData>,
): BarPlotConfig {
    return {
        padding: props.padding ?? DEFAULT_BAR_PLOT_CONFIG.padding,
            useDifferentColors:
                props.useDifferentColors ??
                DEFAULT_BAR_PLOT_CONFIG.useDifferentColors,
    };
}

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
        this.barPlotConfig = getBarPlotConfig(this.props);
    }

    onSetupDomain() {
        const minValue = this.config.scaleConfig.logY ? 1 : 0;

        this.domain = {
            ...this.domain,
            y: (this.config.domainConfig.domainY as [number, number]) ?? [minValue, this.domain.y[1]],
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
        const data = (this.props.data ?? []) as DataRecord[];
        const xValues = data.map((d) => d[this.props.xClass]);
        const categoryDomain = this.domainManager.getDomain(xValues);
        const colorScale = this.barPlotConfig.useDifferentColors
            ? this.scaleManager.getColorScale(categoryDomain)
            : this.config.colorConfig.defaultColor;

        const fillOption =
            typeof colorScale === 'function'
                ? (d: Record<string, any>) =>
                      (colorScale as (value: unknown) => string)(
                          d[this.props.xClass]
                      )
                : colorScale;

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
                fill: fillOption,
                coordinateSystem: 'pixel',
            }
        );
    }
}

export default BaseBarPlot;
