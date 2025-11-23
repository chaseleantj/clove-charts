import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    Scale,
} from '@/components/plots/common/base-plot';

export interface MatrixPlotConfig {
    padding: number;
    showGrid: boolean;
    showCellLabel: boolean;
    colorByClass: string;
}

export interface MatrixPlotProps
    extends BasePlotProps,
        Partial<MatrixPlotConfig> {
    data: Record<string, any>[];
    xClass: string;
    yClass: string;
}

export interface MatrixPlotDomain {
    x: string[];
    y: string[];
    color: [number, number] | [Date, Date] | string[];
}

interface MatrixPlotScale extends Scale {
    x: d3.ScaleBand<string>;
    y: d3.ScaleBand<string>;
    color:
        | d3.ScaleSequential<string, never>
        | d3.ScaleOrdinal<string, string>
        | string;
}

export const DEFAULT_MATRIX_PLOT_CONFIG: Partial<MatrixPlotConfig> = {
    padding: 0.05,
    showGrid: false,
    showCellLabel: true,
};

export function getMatrixPlotConfig(
    props: MatrixPlotProps
): MatrixPlotConfig {
    return {
        padding: props.padding ?? DEFAULT_MATRIX_PLOT_CONFIG.padding!,
        showGrid: props.showGrid ?? DEFAULT_MATRIX_PLOT_CONFIG.showGrid!,
        showCellLabel:
            props.showCellLabel ?? DEFAULT_MATRIX_PLOT_CONFIG.showCellLabel!,
        colorByClass: props.colorByClass!,
    };
}

class BaseMatrixPlot extends BasePlot {
    declare domain: MatrixPlotDomain;
    declare scale: MatrixPlotScale;
    declare props: MatrixPlotProps;

    matrixPlotConfig!: MatrixPlotConfig;

    constructor(props: MatrixPlotProps) {
        super(props);
        this.matrixPlotConfig = getMatrixPlotConfig(props);
    }

    onSetupScales() {
        this.scale.x = d3
            .scaleBand()
            .domain(this.domain.x)
            .range([0, this.plotWidth])
            .paddingInner(this.matrixPlotConfig.padding)
            .paddingOuter(this.matrixPlotConfig.padding);

        this.scale.y = d3
            .scaleBand()
            .domain(this.domain.y)
            .range([0, this.plotHeight])
            .paddingInner(this.matrixPlotConfig.padding)
            .paddingOuter(this.matrixPlotConfig.padding);

        if (this.matrixPlotConfig.colorByClass) {
            this.domain.color = this.domainManager.getDomain(
                (d) => d[this.matrixPlotConfig.colorByClass]
            );
            this.scale.color = this.scaleManager.getColorScale(
                this.domain.color
            );
        }
    }

    renderElements() {
        this.primitives.addRectangles(
            this.props.data,
            (d) => this.scale.x(d[this.props.xClass]),
            (d) => this.scale.y(d[this.props.yClass]),
            (d) =>
                (this.scale.x(d[this.props.xClass]) as number) +
                this.scale.x.bandwidth(),
            (d) =>
                (this.scale.y(d[this.props.yClass]) as number) +
                this.scale.y.bandwidth(),
            {
                fill: (d) =>
                    typeof this.scale.color === 'function'
                        ? this.scale.color(
                              d[this.matrixPlotConfig.colorByClass]
                          )
                        : this.scale.color,
                coordinateSystem: 'pixel',
                opacity: this.config.themeConfig.opacity
            }
        );

        if (this.matrixPlotConfig.showCellLabel) {
            this.primitives.addTexts(
                this.props.data,
                (d) =>
                    (this.scale.x(d[this.props.xClass]) as number) +
                    this.scale.x.bandwidth() / 2,
                (d) =>
                    (this.scale.y(d[this.props.yClass]) as number) +
                    this.scale.y.bandwidth() / 2,
                (d) => {
                    const val = d[this.matrixPlotConfig.colorByClass];
                    return typeof val === 'number' ? (Math.round(val * 1e2) / 1e2).toString() : val;
                },
                {
                    coordinateSystem: 'pixel',
                    anchor: 'middle',
                    baseline: 'middle',
                    // fontFamily: 'Geist'
                }
            );
        }
    }

    onSetupLegend() {
        if (!this.matrixPlotConfig.colorByClass) return;

        this.legendManager.setTitle(this.matrixPlotConfig.colorByClass);

        if (typeof this.scale.color !== 'string') {
            this.legendManager.addLegend(this.scale.color, 'rect');
        }
    }
}

export default BaseMatrixPlot;

