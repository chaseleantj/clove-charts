import * as d3 from 'd3';
import { DataValue, DataAccessor } from '@/components/plots/common/config';
import { getDataType } from '@/components/plots/common/utils';

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

    getDomain(
        accessor: DataAccessor<T, DataValue>,
        padding = 0
    ): string[] | [number, number] | [Date, Date] {
        const dataType = getDataType(this.data, accessor);

        if (dataType === 'string') {
            return [
                ...new Set(this.data.map(accessor as DataAccessor<T, string>)),
            ];
        } else {
            return this.getNumericalDomain(
                accessor as DataAccessor<T, number | Date>,
                padding
            );
        }
    }

    getNumericalDomain(
        accessor: DataAccessor<T, number | Date>,
        padding = 0
    ): [number, number] | [Date, Date] {
        const minValue = d3.min(this.data, accessor);
        const maxValue = d3.max(this.data, accessor);

        // Handle undefined/null cases
        if (minValue === undefined || maxValue === undefined) {
            console.warn('Unable to find data domain! Using defaults [0, 1]');
            return [0, 1];
        }

        const dataType = getDataType(this.data, accessor);

        if (
            dataType === 'date' &&
            minValue instanceof Date &&
            maxValue instanceof Date
        ) {
            const diff = maxValue.getTime() - minValue.getTime();
            return [
                new Date(minValue.getTime() - padding * diff),
                new Date(maxValue.getTime() + padding * diff),
            ];
        }

        if (typeof minValue === 'number' && typeof maxValue === 'number') {
            if (isNaN(minValue) || isNaN(maxValue)) {
                console.warn(
                    'Unable to find data domain! Using defaults [0, 1]'
                );
                return [0, 1];
            }
            return this.padDomain([minValue, maxValue], padding);
        }

        console.warn('Unable to determine data type! Using defaults [0, 1]');
        return [0, 1];
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
