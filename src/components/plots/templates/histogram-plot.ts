import * as d3 from 'd3';

import BasePlot, { BasePlotProps } from '@/components/plots/common/base-plot';
import ScaleManager from '@/components/plots/common/scale-manager';

export interface HistogramPlotConfig {
    numBins: number;
    barOpacity: number;
}

interface HistogramPlotProps extends Omit<BasePlotProps, 'yClass'>, Partial<HistogramPlotConfig> {
    data: Record<string, any>[];
    xClass: string;
}

interface HistogramPlotDomain {
    x: [number, number];
    y: [number, number];
}

export const DEFAULT_HISTOGRAM_PLOT_CONFIG: HistogramPlotConfig = {
    numBins: 20,
    barOpacity: 1,
}

class BaseHistogramPlot extends BasePlot {

    bins!: d3.Bin<number, number>[];
    declare domain: HistogramPlotDomain;
    declare props: HistogramPlotProps;

    histogramPlotConfig!: HistogramPlotConfig;

    constructor(props: HistogramPlotProps) {
        super(props);
        this.bins = [];
        this.histogramPlotConfig = {
            numBins: props.numBins ?? DEFAULT_HISTOGRAM_PLOT_CONFIG.numBins,
            barOpacity: props.barOpacity ?? DEFAULT_HISTOGRAM_PLOT_CONFIG.barOpacity,
        };
    }

    shouldInitializeChart(): boolean {
        return this.props.data.length > 0;
    }

    onSetupDomain() {
        if (this.config.scaleConfig.logX) {
            this.domain.x = [
                Math.log10(this.domain.x[0]),
                Math.log10(this.domain.x[1]),
            ];
        }
        // y-domain cannot be setup yet
    }

    setupScales() {
        this.scaleManager = new ScaleManager(this.config.colorConfig);

        const scaleX = this.scaleManager.getScale(
            this.domain.x,
            [0, this.plotWidth],
            // For histograms, the x-scale is always linear after domain adjustment for logX
            false,
            this.config.scaleConfig.formatNiceX
        );

        const numBins = this.histogramPlotConfig.numBins;

        const histogramGenerator = d3
            .bin()
            .domain(scaleX.domain() as [number, number])
            .thresholds(scaleX.ticks(numBins));

        const data: number[] = this.props.data.map((d: Record<string, any>) => {
            return this.config.scaleConfig.logX
            ? Math.log10(d[this.props.xClass])
            : d[this.props.xClass]
        })

        this.bins = histogramGenerator(data);

        const yMax = d3.max(this.bins, (d) => d.length) as number;
        this.domain.y = this.config.scaleConfig.logY
            ? [1, Math.max(1, yMax)]
            : [0, yMax];

        const scaleY = this.scaleManager.getScale(
            this.domain.y,
            [this.plotHeight, 0],
            this.config.scaleConfig.logY,
            this.config.scaleConfig.formatNiceY
        );

        this.scale = {
            x: scaleX,
            y: scaleY,
        }

        this.onSetupScales();
    }

    renderElements() {
        const barOpacity = this.histogramPlotConfig.barOpacity;
        const barColor = this.config.colorConfig.defaultColor;

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

        this.primitives.addRectangles(
            data,
            (d) => d.x1,
            (d) => d.y1,
            (d) => d.x2,
            (d) => d.y2,
            {
                fill: barColor,
                opacity: barOpacity,
            }
        );
    }
}

export default BaseHistogramPlot;
