import { isNil, isNaN, isArray } from "lodash";

export function isString(obj: any): obj is string {
  return !isNil(obj) && typeof obj === "string";
}

export function isNumber(obj: any): obj is number {
  return !isNil(obj) && !isNaN(obj) && typeof obj === "number";
}

export function isArrayOf<T>(
  obj: any,
  elem: (obj: T) => boolean
): obj is Array<T> {
  return !isNil(obj) && isArray(obj) && obj.every(elem);
}
