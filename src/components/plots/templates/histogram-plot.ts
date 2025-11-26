import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    DataKey,
} from '@/components/plots/common/base-plot';
import ScaleManager from '@/components/plots/common/scale-manager';

export interface HistogramPlotConfig {
    numBins: number;
}

export const DEFAULT_HISTOGRAM_PLOT_CONFIG: HistogramPlotConfig = {
    numBins: 20,
};

interface HistogramPlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends Omit<BasePlotProps<TData>, 'yClass'>,
        Partial<HistogramPlotConfig> {
    data: TData[];
    xClass: DataKey<TData>;
}

interface HistogramPlotDomain {
    x: [number, number];
    y: [number, number];
}

export function getHistogramPlotConfig<TData extends Record<string, any>>(
    props: HistogramPlotProps<TData>
) {
    return {
        numBins: props.numBins ?? DEFAULT_HISTOGRAM_PLOT_CONFIG.numBins,
    };
}

class BaseHistogramPlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    bins: d3.Bin<number, number>[];
    declare domain: HistogramPlotDomain;
    declare props: HistogramPlotProps<TData>;

    histogramPlotConfig!: HistogramPlotConfig;

    constructor(props: HistogramPlotProps<TData>) {
        super(props);
        this.bins = [];
    }

    shouldInitializeChart(): boolean {
        return this.props.data.length > 0;
    }

    onInitializeProperties(): void {
        this.histogramPlotConfig = getHistogramPlotConfig(this.props);
    }

    protected configureDomainAndScales(): void {
        let domainX = this.getDefaultDomainX() as [number, number];
        if (this.config.scaleConfig.logX) {
            domainX = [
                Math.log10(this.domain.x[0]),
                Math.log10(this.domain.x[1]),
            ];
        }

        const scaleX = this.scaleManager.getScale(
            domainX,
            [0, this.plotWidth],
            // For histograms, the x-scale is always linear after domain adjustment for logX
            false,
            this.config.scaleConfig.formatNiceX
        );

        const histogramGenerator = d3
            .bin()
            .domain(scaleX.domain() as [number, number])
            .thresholds(scaleX.ticks(this.histogramPlotConfig.numBins));

        const data: number[] = this.props.data.map((d: Record<string, any>) => {
            return this.config.scaleConfig.logX
                ? Math.log10(d[this.props.xClass])
                : d[this.props.xClass];
        });

        this.bins = histogramGenerator(data);
        const yMax = d3.max(this.bins, (d) => d.length) as number;

        let domainY = this.config.scaleConfig.logY
            ? [1, Math.max(1, yMax)]
            : [0, yMax];

        const scaleY = this.scaleManager.getScale(
            domainY as [number, number],
            [this.plotHeight, 0],
            this.config.scaleConfig.logY,
            this.config.scaleConfig.formatNiceY
        );

        this.domain = {
            x: domainX as [number, number],
            y: domainY as [number, number],
        };

        this.scale = {
            x: scaleX,
            y: scaleY,
        };
    }

    draw() {
        const data = this.bins
            .filter((binData) => binData.length > 0)
            .map((binData) => {
                const x0 = binData.x0 ?? binData.x1 ?? 0;
                const x1 = binData.x1 ?? binData.x0 ?? x0;
                const pad = 0.025 * (x1 - x0);
                return {
                    x1: x0 + pad,
                    y1: binData.length,
                    x2: x1 - pad,
                    y2: this.domain.y[0],
                };
            });

        this.primitiveManager.addRectangles(
            data,
            (d) => d.x1,
            (d) => d.y1,
            (d) => d.x2,
            (d) => d.y2,
            {
                fill: this.config.colorConfig.defaultColor,
                opacity: this.config.themeConfig.opacity,
            }
        );
    }
}

export default BaseHistogramPlot;
