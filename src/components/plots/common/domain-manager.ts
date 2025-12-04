import * as d3 from 'd3';
import { DomainConfig, ScaleConfig } from './config';
import {
    isDateArray,
    isDateValue,
    isDefined,
    isNumberArray,
    isNumberValue,
    isStringArray,
    isStringValue,
} from './utils/type-guards';

export type DataValue = string | number | Date | null | undefined;

class DomainManager {
    constructor(
        private readonly domainConfig: Required<DomainConfig>,
        private readonly scaleConfig: Required<ScaleConfig>
    ) {}

    getDomain(values: string[], padding?: number): string[];
    getDomain(values: number[], padding?: number): [number, number];
    getDomain(values: Date[], padding?: number): [Date, Date];
    getDomain(
        values: DataValue[],
        padding = 0
    ): string[] | [number, number] | [Date, Date] {
        const cleanValues = values.filter(isDefined);

        if (cleanValues.length === 0) {
            console.warn('Unable to find data domain! Using defaults [0, 1]');
            return [0, 1];
        }

        if (cleanValues.every(isStringValue)) {
            return [...new Set(cleanValues as string[])];
        }

        if (cleanValues.every(isDateValue)) {
            return this.getDateDomain(cleanValues as Date[], padding);
        }

        if (cleanValues.every(isNumberValue)) {
            return this.getNumberDomain(cleanValues as number[], padding);
        }

        console.warn('Mixed or unsupported data types! Using defaults [0, 1]');
        return [0, 1];
    }

    getDomainX(): [number, number];
    getDomainX(values: string[]): string[];
    getDomainX(values: number[]): [number, number];
    getDomainX(values: Date[]): [Date, Date];
    getDomainX(
        values?: DataValue[]
    ): string[] | [number, number] | [Date, Date] {
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

    getDomainY(): [number, number];
    getDomainY(values: string[]): string[];
    getDomainY(values: number[]): [number, number];
    getDomainY(values: Date[]): [Date, Date];
    getDomainY(
        values?: DataValue[]
    ): string[] | [number, number] | [Date, Date] {
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

    private getDateDomain(values: Date[], padding: number): [Date, Date] {
        const [minValue, maxValue] = d3.extent(values) as [Date, Date];

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

    private getNumberDomain(
        values: number[],
        padding: number
    ): [number, number] {
        const [minValue, maxValue] = d3.extent(values) as [number, number];

        if (
            minValue === undefined ||
            maxValue === undefined ||
            Number.isNaN(minValue) ||
            Number.isNaN(maxValue)
        ) {
            console.warn('Invalid number domain! Using defaults [0, 1]');
            return [0, 1];
        }

        const diff = maxValue - minValue;
        return [minValue - padding * diff, maxValue + padding * diff];
    }
}

export default DomainManager;
