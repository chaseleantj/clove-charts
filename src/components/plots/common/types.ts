export type DataValue = string | number | Date;
export type DataAccessor<T, R extends DataValue> = (d: T) => R;

export type AnyDomain = string[] | [Date, Date] | [number, number];
export type AnyRange = string[] | [number, number];

export const enum CoordinateSystem {
    Data = 'data',
    Pixel = 'pixel',
}

export type TickFormatFunction = (domainValue: string, index: number) => string;
