import * as d3 from 'd3';
import BasePlot from '../common/base-plot';
import { mergeWithDefaults } from '../common/utils';
export const DEFAULT_HISTOGRAM_PLOT_CONFIG = {
    numBins: 10,
    barPadding: 0.025,
};
class HistogramPlot extends BasePlot {
    constructor(props) {
        super(props);
        this.bins = [];
    }
    shouldInitializeChart() {
        return this.props.data.length > 0;
    }
    onInitializeProperties() {
        this.histogramPlotConfig = mergeWithDefaults(DEFAULT_HISTOGRAM_PLOT_CONFIG, this.props);
    }
    configureDomainAndScales() {
        let domainX = this.getDefaultDomainX();
        if (this.config.scaleConfig.logX) {
            domainX = [
                Math.log10(this.domain.x[0]),
                Math.log10(this.domain.x[1]),
            ];
        }
        const scaleX = this.scaleManager.getScale(domainX, [0, this.plotWidth], 
        // For histograms, the x-scale is always linear after domain adjustment for logX
        false, this.config.scaleConfig.formatNiceX);
        const histogramGenerator = d3
            .bin()
            .domain(scaleX.domain())
            .thresholds(scaleX.ticks(this.histogramPlotConfig.numBins));
        const data = this.props.data.map((d) => {
            return this.config.scaleConfig.logX
                ? Math.log10(d[this.props.xKey])
                : d[this.props.xKey];
        });
        this.bins = histogramGenerator(data);
        const yMax = d3.max(this.bins, (d) => d.length);
        let domainY = this.config.scaleConfig.logY
            ? [1, Math.max(1, yMax)]
            : [0, yMax];
        const scaleY = this.scaleManager.getScale(domainY, [this.plotHeight, 0], this.config.scaleConfig.logY, this.config.scaleConfig.formatNiceY);
        this.domain = {
            x: domainX,
            y: domainY,
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
            var _a, _b, _c, _d;
            const x0 = (_b = (_a = binData.x0) !== null && _a !== void 0 ? _a : binData.x1) !== null && _b !== void 0 ? _b : 0;
            const x1 = (_d = (_c = binData.x1) !== null && _c !== void 0 ? _c : binData.x0) !== null && _d !== void 0 ? _d : x0;
            const pad = this.histogramPlotConfig.barPadding * (x1 - x0);
            return {
                x1: x0 + pad,
                y1: binData.length,
                x2: x1 - pad,
                y2: this.domain.y[0],
            };
        });
        this.primitiveManager.addRectangles(data, (d) => d.x1, (d) => d.y1, (d) => d.x2, (d) => d.y2, {
            fill: this.config.colorConfig.defaultColor,
            opacity: this.config.themeConfig.opacity,
        });
    }
}
export default HistogramPlot;
