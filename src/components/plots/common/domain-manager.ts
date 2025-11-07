import * as d3 from 'd3';
import { DataValue, DataAccessor } from '@/components/plots/common/typing';
import {
    isDateValue,
    isDefined,
    isNumberValue,
    isStringValue,
} from '@/components/plots/common/type-guards';

class DomainManager<T extends Record<string, any>> {
    constructor(private readonly data: T[]) {}

    getDomain<R extends string>(
        accessor: DataAccessor<T, R>,
        padding?: number
    ): string[];

    getDomain<R extends number>(
        accessor: DataAccessor<T, R>,
        padding?: number
    ): [number, number];

    getDomain<R extends Date>(
        accessor: DataAccessor<T, R>,
        padding?: number
    ): [Date, Date];

    public getDomain(
        accessor: DataAccessor<T, DataValue>,
        padding = 0
    ): string[] | [number, number] | [Date, Date] {
        const values = this.collectValues(accessor);

        if (values.length === 0) {
            console.warn('Unable to find data domain! Using defaults [0, 1]');
            return [0, 1];
        }

        if (values.every(isStringValue)) {
            return [...new Set(values as string[])];
        }

        if (values.every(isDateValue)) {
            const dateDomain = this.getDateDomain(values as Date[], padding);
            if (dateDomain) return dateDomain;
        }

        if (values.every(isNumberValue)) {
            const numberDomain = this.getNumberDomain(
                values as number[],
                padding
            );
            if (numberDomain) return numberDomain;
        }

        console.warn('Mixed or unsupported data types! Using defaults [0, 1]');
        return [0, 1];
    }

    private collectValues<R extends DataValue>(
        accessor: DataAccessor<T, R>
    ): DataValue[] {
        return this.data.map(accessor).filter(isDefined) as DataValue[];
    }

    private getDateDomain(
        values: Date[],
        padding = 0
    ): [Date, Date] | undefined {
        const [minValue, maxValue] = d3.extent(values) as [
            Date | undefined,
            Date | undefined,
        ];

        if (!minValue || !maxValue) {
            return undefined;
        }

        const diff = maxValue.getTime() - minValue.getTime();
        return [
            new Date(minValue.getTime() - padding * diff),
            new Date(maxValue.getTime() + padding * diff),
        ];
    }

    private getNumberDomain(
        values: number[],
        padding = 0
    ): [number, number] | undefined {
        const cleanValues = values.filter(isNumberValue);
        if (cleanValues.length === 0) {
            return undefined;
        }

        const [minValue, maxValue] = d3.extent(cleanValues) as [
            number | undefined,
            number | undefined,
        ];

        if (
            minValue === undefined ||
            maxValue === undefined ||
            Number.isNaN(minValue) ||
            Number.isNaN(maxValue)
        ) {
            return undefined;
        }

        return this.padDomain([minValue, maxValue], padding);
    }

    private padDomain(
        domain: [number, number],
        padding: number
    ): [number, number] {
        const [min, max] = domain;
        const diff = max - min;
        return [min - padding * diff, max + padding * diff];
    }
}

export default DomainManager;
