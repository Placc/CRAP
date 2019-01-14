import { Configuration, isConfiguration } from "common/config/types";
import { isEmpty, isNil } from "lodash";
import { isArrayOf, isString } from "common/util/guards";

export type PublisherConfiguration = Configuration & {
  domains: string[];
};

export const isPublisherConfiguration = (
  obj: any
): obj is PublisherConfiguration => {
  if (!isNil(obj)) {
    const { domains, ...config } = obj;
    return (
      isConfiguration(config) &&
      isArrayOf<string>(domains, isString) &&
      !isEmpty(domains)
    );
  }
  return false;
};
