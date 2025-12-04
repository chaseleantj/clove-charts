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
const d3 = __importStar(require("d3"));
const type_guards_1 = require("./utils/type-guards");
class DomainManager {
    constructor(domainConfig, scaleConfig) {
        this.domainConfig = domainConfig;
        this.scaleConfig = scaleConfig;
    }
    getDomain(values, padding = 0) {
        const cleanValues = values.filter(type_guards_1.isDefined);
        if (cleanValues.length === 0) {
            console.warn('Unable to find data domain! Using defaults [0, 1]');
            return [0, 1];
        }
        if (cleanValues.every(type_guards_1.isStringValue)) {
            return [...new Set(cleanValues)];
        }
        if (cleanValues.every(type_guards_1.isDateValue)) {
            return this.getDateDomain(cleanValues, padding);
        }
        if (cleanValues.every(type_guards_1.isNumberValue)) {
            return this.getNumberDomain(cleanValues, padding);
        }
        console.warn('Mixed or unsupported data types! Using defaults [0, 1]');
        return [0, 1];
    }
    getDomainX(values) {
        if (this.domainConfig.domainX) {
            return this.domainConfig.domainX;
        }
        if (!values || values.length === 0) {
            return this.domainConfig.defaultDomainX;
        }
        const padding = this.scaleConfig.logX ? 0 : this.domainConfig.paddingX;
        if ((0, type_guards_1.isStringArray)(values)) {
            return this.getDomain(values, padding);
        }
        if ((0, type_guards_1.isNumberArray)(values)) {
            return this.getDomain(values, padding);
        }
        if ((0, type_guards_1.isDateArray)(values)) {
            return this.getDomain(values, padding);
        }
        console.warn('Mixed or unsupported X domain types! Using defaults');
        return this.domainConfig.defaultDomainX;
    }
    getDomainY(values) {
        if (this.domainConfig.domainY) {
            return this.domainConfig.domainY;
        }
        if (!values || values.length === 0) {
            return this.domainConfig.defaultDomainY;
        }
        const padding = this.scaleConfig.logY ? 0 : this.domainConfig.paddingY;
        if ((0, type_guards_1.isStringArray)(values)) {
            return this.getDomain(values, padding);
        }
        if ((0, type_guards_1.isNumberArray)(values)) {
            return this.getDomain(values, padding);
        }
        if ((0, type_guards_1.isDateArray)(values)) {
            return this.getDomain(values, padding);
        }
        console.warn('Mixed or unsupported Y domain types! Using defaults');
        return this.domainConfig.defaultDomainY;
    }
    getDateDomain(values, padding) {
        const [minValue, maxValue] = d3.extent(values);
        if (!minValue || !maxValue) {
            console.warn('Invalid date domain! Using defaults');
            return [new Date(0), new Date()];
        }
        const diff = maxValue.getTime() - minValue.getTime();
        return [
            new Date(minValue.getTime() - padding * diff),
            new Date(maxValue.getTime() + padding * diff),
        ];
    }
    getNumberDomain(values, padding) {
        const [minValue, maxValue] = d3.extent(values);
        if (minValue === undefined ||
            maxValue === undefined ||
            Number.isNaN(minValue) ||
            Number.isNaN(maxValue)) {
            console.warn('Invalid number domain! Using defaults [0, 1]');
            return [0, 1];
        }
        const diff = maxValue - minValue;
        return [minValue - padding * diff, maxValue + padding * diff];
    }
}
exports.default = DomainManager;
