import {
    adjust,
    compose,
    identity,
    ifElse,
    isEmpty,
    isNil,
    join, lensIndex,
    o, over,
    toString,
    toUpper,
} from "ramda";

export const id = (x: any) => x;

const selectIf = (predicate: any) => (x: any) => predicate(x) && x;

export const isFunction = (f: FunctionConstructor) => typeof f === "function";

export const selectIfFunction = selectIf(isFunction);

const isNumber = (n: any) => typeof n === "number";

const isBoolean = (b: any) => typeof b === "boolean";

const isString = (s: any) => typeof s === "string";

export const isPrimitive = (v: any) =>
    [isString, isNumber, isBoolean, isNil].some((f) => f(v));

export const isSliceValid = (slice: string) => isString(slice) && !isEmpty(slice);

const capitalizeFirstWord = compose(join(""), over(lensIndex(0), toUpper));

const getName = compose(
    capitalizeFirstWord,
    ifElse(isString, identity, toString),
);

export const getSelectorName = (key: string) => `get${getName(key)}`;

export const getActionCreatorName = (key: string) => `set${getName(key)}`;

export const getType = (slice: string, actionCreatorName: string) =>
    `${slice}/${actionCreatorName}`;
