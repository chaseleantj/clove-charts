import * as d3 from 'd3';
import styles from './page.module.css';
import { getDataType } from './utils';
import { DEFAULT_COLOR_CONFIG } from './config';

class ScaleManager {
    constructor(colorConfig = {}) {
        this.colorConfig = {
            ...DEFAULT_COLOR_CONFIG,
            ...colorConfig,
        };
    }

    getScale(domain, range, log = false, formatNiceScales = false) {
        let scaleFunction;
        const dtype = getDataType(domain);

        if (dtype === 'string') {
            scaleFunction = d3.scaleOrdinal;
        } else if (dtype === 'date') {
            scaleFunction = d3.scaleTime;
        } else if (log) {
            scaleFunction = d3.scaleLog;
        } else {
            scaleFunction = d3.scaleLinear;
        }

        if (formatNiceScales && dtype != 'string') {
            return scaleFunction().domain(domain).range(range).nice();
        } else {
            return scaleFunction().domain(domain).range(range);
        }
    }

    getColorScale(domain = null, colorScheme = null) {
        const defaultScale = () => this.colorConfig.defaultColor;

        if (!domain) {
            return defaultScale;
        }

        const dtype = getDataType(domain);

        if (dtype === 'string') {
            return d3
                .scaleOrdinal()
                .domain(domain)
                .range(colorScheme ?? this.colorConfig.categoricalColorScheme);
        } else if (dtype === 'number') {
            return d3
                .scaleSequential()
                .domain(domain)
                .interpolator(
                    colorScheme ?? this.colorConfig.continuousColorScheme
                )
                .nice();
        } else {
            return defaultScale;
        }
    }

    setScaleDomain(scale, domain, formatNiceScales) {
        if (formatNiceScales) {
            scale.domain(domain).nice();
        } else {
            scale.domain(domain);
        }
    }

    getDomainToRangeFactor(scale) {
        const domain = scale.domain();
        const range = scale.range();

        // Handle different scale types
        if (typeof domain[0] === 'string') {
            // Ordinal scale - use bandwidth or step
            return scale.bandwidth?.() || scale.step?.() || 1;
        } else {
            // Continuous scale - calculate ratio
            return (
                Math.abs(range[1] - range[0]) / Math.abs(domain[1] - domain[0])
            );
        }
    }
}

export default ScaleManager;
