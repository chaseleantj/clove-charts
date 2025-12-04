import * as d3 from 'd3';
import { isDateArray, isDateValue, isDefined, isNumberArray, isNumberValue, isStringArray, isStringValue, } from './utils/type-guards';
class DomainManager {
    constructor(domainConfig, scaleConfig) {
        this.domainConfig = domainConfig;
        this.scaleConfig = scaleConfig;
    }
    getDomain(values, padding = 0) {
        const cleanValues = values.filter(isDefined);
        if (cleanValues.length === 0) {
            console.warn('Unable to find data domain! Using defaults [0, 1]');
            return [0, 1];
        }
        if (cleanValues.every(isStringValue)) {
            return [...new Set(cleanValues)];
        }
        if (cleanValues.every(isDateValue)) {
            return this.getDateDomain(cleanValues, padding);
        }
        if (cleanValues.every(isNumberValue)) {
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
        if (isStringArray(values)) {
            return this.getDomain(values, padding);
        }
        if (isNumberArray(values)) {
            return this.getDomain(values, padding);
        }
        if (isDateArray(values)) {
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
        if (isStringArray(values)) {
            return this.getDomain(values, padding);
        }
        if (isNumberArray(values)) {
            return this.getDomain(values, padding);
        }
        if (isDateArray(values)) {
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
export default DomainManager;
