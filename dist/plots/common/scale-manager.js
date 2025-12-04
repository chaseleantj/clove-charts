import * as d3 from 'd3';
import { isDateTuple, isNumberTuple, isStringArray, } from './utils/type-guards';
export function isContinuousScale(scale) {
    return 'invert' in scale;
}
class ScaleManager {
    constructor(scaleConfig, colorConfig) {
        this.scaleConfig = scaleConfig;
        this.colorConfig = colorConfig;
    }
    getScale(domain, range, log = false, formatNiceScales = false) {
        if (isStringArray(domain)) {
            if (isNumberTuple(range)) {
                return d3.scaleBand().domain(domain).range(range);
            }
            return d3
                .scaleOrdinal()
                .domain(domain)
                .range(range);
        }
        if (isDateTuple(domain)) {
            const scale = d3
                .scaleTime()
                .domain(domain)
                .range(range);
            return formatNiceScales ? scale.nice() : scale;
        }
        if (isNumberTuple(domain)) {
            if (log) {
                const scale = d3
                    .scaleLog()
                    .domain(domain)
                    .range(range);
                return formatNiceScales ? scale.nice() : scale;
            }
            else {
                const scale = d3
                    .scaleLinear()
                    .domain(domain)
                    .range(range);
                return formatNiceScales ? scale.nice() : scale;
            }
        }
        throw new Error('Invalid domain type!');
    }
    getColorScale(domain, colorScheme) {
        if (isStringArray(domain)) {
            const colorRange = (colorScheme !== null && colorScheme !== void 0 ? colorScheme : this.colorConfig.categoricalColorScheme);
            return d3
                .scaleOrdinal()
                .domain(domain)
                .range(colorRange);
        }
        else {
            const colorInterpolator = colorScheme !== null && colorScheme !== void 0 ? colorScheme : this.colorConfig.continuousColorScheme;
            return d3.scaleSequential(colorInterpolator).domain(domain);
            // .nice();
        }
    }
    setScaleDomain(scale, domain, formatNiceScales) {
        if (isStringArray(domain)) {
            const categoricalScale = scale;
            categoricalScale.domain(domain);
        }
        else if (isDateTuple(domain)) {
            const timeScale = scale;
            if (formatNiceScales) {
                timeScale.domain(domain).nice();
            }
            else {
                timeScale.domain(domain);
            }
        }
        else if (isNumberTuple(domain)) {
            const numericScale = scale;
            if (formatNiceScales) {
                numericScale.domain(domain).nice();
            }
            else {
                numericScale.domain(domain);
            }
        }
    }
    getDomainToRangeFactor(scale) {
        const domain = scale.domain();
        const range = scale.range();
        return Math.abs(range[1] - range[0]) / Math.abs(domain[1] - domain[0]);
    }
    getScaleX(domain, plotWidth) {
        var _a, _b, _c, _d;
        const log = (_b = (_a = this.scaleConfig) === null || _a === void 0 ? void 0 : _a.logX) !== null && _b !== void 0 ? _b : false;
        const formatNice = (_d = (_c = this.scaleConfig) === null || _c === void 0 ? void 0 : _c.formatNiceX) !== null && _d !== void 0 ? _d : false;
        return this.getScale(domain, [0, plotWidth], log, formatNice);
    }
    getScaleY(domain, plotHeight) {
        var _a, _b, _c, _d;
        const log = (_b = (_a = this.scaleConfig) === null || _a === void 0 ? void 0 : _a.logY) !== null && _b !== void 0 ? _b : false;
        const formatNice = (_d = (_c = this.scaleConfig) === null || _c === void 0 ? void 0 : _c.formatNiceY) !== null && _d !== void 0 ? _d : false;
        return this.getScale(domain, [plotHeight, 0], log, formatNice);
    }
}
export default ScaleManager;
