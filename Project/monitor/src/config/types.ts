import { isNil } from "lodash";
import { isArrayOf, isString, isNumber } from "common/util/guards";

export type MonitorConfiguration = {
  knownCAs: string[];
  timeout: number;
};

export const isMonitorConfiguration = (
  obj: any
): obj is MonitorConfiguration => {
  return (
    !isNil(obj) &&
    isArrayOf<string>(obj.knownCAs, isString) &&
    isNumber(obj.timeout)
  );
};
