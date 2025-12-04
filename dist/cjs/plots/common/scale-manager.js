"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isContinuousScale = isContinuousScale;
const d3 = __importStar(require("d3"));
const type_guards_1 = require("./utils/type-guards");
function isContinuousScale(scale) {
    return 'invert' in scale;
}
class ScaleManager {
    constructor(scaleConfig, colorConfig) {
        this.scaleConfig = scaleConfig;
        this.colorConfig = colorConfig;
    }
    getScale(domain, range, log = false, formatNiceScales = false) {
        if ((0, type_guards_1.isStringArray)(domain)) {
            if ((0, type_guards_1.isNumberTuple)(range)) {
                return d3.scaleBand().domain(domain).range(range);
            }
            return d3
                .scaleOrdinal()
                .domain(domain)
                .range(range);
        }
        if ((0, type_guards_1.isDateTuple)(domain)) {
            const scale = d3
                .scaleTime()
                .domain(domain)
                .range(range);
            return formatNiceScales ? scale.nice() : scale;
        }
        if ((0, type_guards_1.isNumberTuple)(domain)) {
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
        if ((0, type_guards_1.isStringArray)(domain)) {
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
        if ((0, type_guards_1.isStringArray)(domain)) {
            const categoricalScale = scale;
            categoricalScale.domain(domain);
        }
        else if ((0, type_guards_1.isDateTuple)(domain)) {
            const timeScale = scale;
            if (formatNiceScales) {
                timeScale.domain(domain).nice();
            }
            else {
                timeScale.domain(domain);
            }
        }
        else if ((0, type_guards_1.isNumberTuple)(domain)) {
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
exports.default = ScaleManager;
