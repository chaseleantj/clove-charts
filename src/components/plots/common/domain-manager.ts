import * as d3 from 'd3';
import { DomainConfig, ScaleConfig } from '@/components/plots/common/config';
import {
    isDateValue,
    isDefined,
    isNumberValue,
    isStringValue,
} from '@/components/plots/common/type-guards';

export type DataValue = string | number | Date | null | undefined;

class DomainManager {
    constructor(
        private readonly domainConfig: Required<DomainConfig>,
        private readonly scaleConfig: Required<ScaleConfig>
    ) {}

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
        return this.getDomain(values, padding);
    }

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
        return this.getDomain(values, padding);
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
