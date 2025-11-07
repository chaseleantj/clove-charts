import { AnyDomain } from '@/components/plots/common/types';

export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function isStringValue(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumberValue(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

export function isDateValue(value: unknown): value is Date {
    return value instanceof Date;
}

export function isStringArray(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string')
    );
}

export function isNumberArray(value: unknown): value is number[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'number' && Number.isFinite(item))
    );
}

export function isDateArray(value: unknown): value is Date[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item instanceof Date)
    );
}

export function isNumberTuple(value: unknown): value is [number, number] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        Number.isFinite(value[0]) &&
        Number.isFinite(value[1])
    );
}

export function isDateTuple(value: unknown): value is [Date, Date] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        value[0] instanceof Date &&
        value[1] instanceof Date
    );
}

export function getDomainKind(
    domain: AnyDomain
): 'string' | 'number' | 'date' | 'unknown' {
    if (isStringArray(domain)) return 'string';
    if (isNumberTuple(domain)) return 'number';
    if (isDateTuple(domain)) return 'date';
    return 'unknown';
}
