export declare function isDefined<T>(value: T | null | undefined): value is T;
export declare function isStringValue(value: unknown): value is string;
export declare function isNumberValue(value: unknown): value is number;
export declare function isDateValue(value: unknown): value is Date;
export declare function isStringArray(value: unknown): value is string[];
export declare function isNumberArray(value: unknown): value is number[];
export declare function isDateArray(value: unknown): value is Date[];
export declare function isNumberTuple(value: unknown): value is [number, number];
export declare function isDateTuple(value: unknown): value is [Date, Date];
