export function isDefined(value) {
    return value !== null && value !== undefined;
}
export function isStringValue(value) {
    return typeof value === 'string';
}
export function isNumberValue(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
export function isDateValue(value) {
    return value instanceof Date;
}
export function isStringArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string'));
}
export function isNumberArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'number' && Number.isFinite(item)));
}
export function isDateArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item instanceof Date));
}
export function isNumberTuple(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        Number.isFinite(value[0]) &&
        Number.isFinite(value[1]));
}
export function isDateTuple(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        value[0] instanceof Date &&
        value[1] instanceof Date);
}
