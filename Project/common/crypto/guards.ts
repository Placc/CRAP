import { CryptoKey } from "./types";
import { isNil } from "lodash";
import { isString } from "../util/guards";

export const isCryptoKey = (obj: any): obj is CryptoKey => {
  return (
    !isNil(obj) && isString(obj.data) && /*TODO verify*/ isString(obj.format)
  );
};
