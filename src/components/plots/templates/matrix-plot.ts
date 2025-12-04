import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    DataKey,
    DataRecord,
    Scale,
} from '../common/base-plot';

export interface MatrixPlotConfig {
    padding: number;
    showGrid: boolean;
    showCellLabel: boolean;
}

export interface MatrixPlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlotProps<TData>,
        Partial<MatrixPlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKey: DataKey<TData>;
    valueKey: DataKey<TData>;
}

export interface MatrixPlotDomain {
    x: string[];
    y: string[];
    color?: [number, number] | [Date, Date] | string[];
}

interface MatrixPlotScale extends Scale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleBand<string>;
    color?: d3.ScaleSequential<string, never> | d3.ScaleOrdinal<string, string>;
    // | string;
}

export const DEFAULT_MATRIX_PLOT_CONFIG: Partial<MatrixPlotConfig> = {
    padding: 0.05,
    showGrid: false,
    showCellLabel: true,
};

export function getMatrixPlotConfig<TData extends Record<string, any>>(
    props: MatrixPlotProps<TData>
): MatrixPlotConfig {
    return {
        padding: props.padding ?? DEFAULT_MATRIX_PLOT_CONFIG.padding!,
        showGrid: props.showGrid ?? DEFAULT_MATRIX_PLOT_CONFIG.showGrid!,
        showCellLabel:
            props.showCellLabel ?? DEFAULT_MATRIX_PLOT_CONFIG.showCellLabel!,
    };
}

class MatrixPlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    declare domain: MatrixPlotDomain;
    declare scale: MatrixPlotScale;
    declare props: MatrixPlotProps<TData>;

    matrixPlotConfig!: MatrixPlotConfig;

    constructor(props: MatrixPlotProps<TData>) {
        super(props);
    }

    onInitializeProperties(): void {
        this.matrixPlotConfig = getMatrixPlotConfig(this.props);
    }

    protected configureDomainAndScales(): void {
        this.domain = this.getDefaultDomain() as MatrixPlotDomain;

        const data = (this.props.data ?? []) as DataRecord[];
        const colorValues = data.map((d) => d[this.props.valueKey]);
        this.domain.color = this.domainManager.getDomain(colorValues);

        this.scale = {
            x: d3
                .scaleBand()
                .domain(this.domain.x)
                .range([0, this.plotWidth])
                .paddingInner(this.matrixPlotConfig.padding)
                .paddingOuter(this.matrixPlotConfig.padding),
            y: d3
                .scaleBand()
                .domain(this.domain.y)
                .range([0, this.plotHeight])
                .paddingInner(this.matrixPlotConfig.padding)
                .paddingOuter(this.matrixPlotConfig.padding),
            color: this.scaleManager.getColorScale(this.domain.color),
        };
    }

    draw() {
        const colorKey = this.props.valueKey;

        this.primitiveManager.addRectangles(
            this.props.data,
            (d) => this.scale.x(d[this.props.xKey]),
            (d) => this.scale.y(d[this.props.yKey]),
            (d) =>
                (this.scale.x(d[this.props.xKey]) as number) +
                this.scale.x.bandwidth(),
            (d) =>
                (this.scale.y(d[this.props.yKey]) as number) +
                this.scale.y.bandwidth(),
            {
                fill: (d) =>
                    this.scale.color && colorKey
                        ? this.scale.color(d[colorKey])
                        : this.config.colorConfig.defaultColor,
                coordinateSystem: 'pixel',
                opacity: this.config.themeConfig.opacity,
            }
        );

        if (this.matrixPlotConfig.showCellLabel && colorKey) {
            this.primitiveManager.addTexts(
                this.props.data,
                (d) =>
                    (this.scale.x(d[this.props.xKey]) as number) +
                    this.scale.x.bandwidth() / 2,
                (d) =>
                    (this.scale.y(d[this.props.yKey]) as number) +
                    this.scale.y.bandwidth() / 2,
                (d) => {
                    const val = d[colorKey];
                    return typeof val === 'number'
                        ? (Math.round(val * 1e2) / 1e2).toString()
                        : val;
                },
                {
                    coordinateSystem: 'pixel',
                    anchor: 'middle',
                    baseline: 'middle',
                }
            );
        }
    }

    drawLegend() {
        this.legendManager.setTitle(
            this.config.legendConfig.title ?? this.props.valueKey
        );

        if (this.scale.color) {
            this.legendManager.addLegend(this.scale.color, 'rect');
        }
    }
}

export default MatrixPlot;
