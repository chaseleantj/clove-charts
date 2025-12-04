"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefined = isDefined;
exports.isStringValue = isStringValue;
exports.isNumberValue = isNumberValue;
exports.isDateValue = isDateValue;
exports.isStringArray = isStringArray;
exports.isNumberArray = isNumberArray;
exports.isDateArray = isDateArray;
exports.isNumberTuple = isNumberTuple;
exports.isDateTuple = isDateTuple;
function isDefined(value) {
    return value !== null && value !== undefined;
}
function isStringValue(value) {
    return typeof value === 'string';
}
function isNumberValue(value) {
    return typeof value === 'number' && Number.isFinite(value);
}
function isDateValue(value) {
    return value instanceof Date;
}
function isStringArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string'));
}
function isNumberArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'number' && Number.isFinite(item)));
}
function isDateArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => item instanceof Date));
}
function isNumberTuple(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number' &&
        Number.isFinite(value[0]) &&
        Number.isFinite(value[1]));
}
function isDateTuple(value) {
    return (Array.isArray(value) &&
        value.length === 2 &&
        value[0] instanceof Date &&
        value[1] instanceof Date);
}
