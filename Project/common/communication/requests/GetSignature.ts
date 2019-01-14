import { isString, isArrayOf, isNumber } from "../../util/guards";
import { isNil } from "lodash";
import { MultiSignature } from "../../certs/types";
import { isMultiSignature } from "../../certs/guards";
import { isRequest, isResponse } from "../guards";
import { Response, Request } from "../types";

export interface GetSignatureRequest extends Request {
  type: "GetSignatureRequest";
  applicationUrl: string;
  deploymentVersion?: number;
}

export const isGetSignatureRequest = (obj: any): obj is GetSignatureRequest => {
  return (
    isRequest(obj) &&
    obj.type === "GetSignatureRequest" &&
    isString(obj["applicationUrl"]) &&
    (isNil(obj["deploymentVersion"]) || isNumber(obj["deploymentVersion"]))
  );
};

export interface GetSignatureResponse extends Response {
  type: "GetSignatureResponse";
  acceptanceConfirmation?: MultiSignature;
  request: GetSignatureRequest;
  cas?: string[];
  ilses?: string[];
}

export const isGetSignatureResponse = (
  obj: any
): obj is GetSignatureResponse => {
  return (
    isResponse(obj) &&
    obj.type === "GetSignatureResponse" &&
    isGetSignatureRequest(obj.request) &&
    (isNil(obj["cas"]) || isArrayOf<string>(obj["cas"], isString)) &&
    (isNil(obj["ilses"]) || isArrayOf<string>(obj["ilses"], isString)) &&
    (isNil(obj["acceptanceConfirmation"]) ||
      isMultiSignature(obj["acceptanceConfirmation"]))
  );
};
