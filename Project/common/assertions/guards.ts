import { Assertion } from "./types";
import { isNil, isObject } from "lodash";
import { isString } from "../util/guards";

export function isAssertion(obj: any): obj is Assertion {
  const validFields = ["assertionIdentifier", "assertionName"];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    isString(obj["assertionIdentifier"]) &&
    isString(obj["assertionName"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}
