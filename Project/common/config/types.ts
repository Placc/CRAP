import { isEmpty, isNil } from "lodash";
import { isArrayOf, isString, isNumber } from "../util/guards";

export type Configuration = {
  defaultCertLifetime: number;
  subjectName: string;
  trustedCAs: string[];
  trustedILSes: string[];
  minimumCAs: number;
  expectedLifetime: number;
};

export const isConfiguration = (info: any): info is Configuration => {
  if (isNil(info)) {
    return false;
  }
  if (
    !info["defaultCertLifetime"] ||
    !Number.isFinite(info.defaultCertLifetime)
  ) {
    return false;
  }
  if (!info["expectedLifetime"] || !Number.isFinite(info.expectedLifetime)) {
    return false;
  }
  if (!info["subjectName"] || isEmpty(info.subjectName)) {
    return false;
  }
  if (
    !info["trustedCAs"] ||
    !isArrayOf<string>(info.trustedCAs, isString) ||
    isEmpty(info.trustedCAs)
  ) {
    return false;
  }
  if (
    !info["trustedCAs"] ||
    !isArrayOf<string>(info.trustedCAs, isString) ||
    isEmpty(info.trustedCAs)
  ) {
    return false;
  }
  if (
    !info["minimumCAs"] ||
    !isNumber(info.minimumCAs) ||
    info.minimumCAs < 2
  ) {
    return false;
  }
  return true;
};
