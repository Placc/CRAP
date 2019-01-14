import { Certificate, ARPKICert } from "../../certs/types";
import { isNil } from "lodash";
import { isARPKICert } from "../../certs/guards";
import { Request, Response, SignedRequest } from "../types";
import { isString } from "../../util/guards";
import { isRequest, isResponse } from "../guards";

export interface GenerateRequest<C extends Certificate> extends SignedRequest {
  type: "GenerateRequest";
  cert: Partial<ARPKICert<C>>;
}

export interface GenerateResponse<C extends Certificate> extends Response {
  type: "GenerateResponse";
  request: GenerateRequest<C>;
  certSignature: string;
}

export const isGenerateRequest = <C extends Certificate>(
  obj: any
): obj is GenerateRequest<C> => {
  return (
    isRequest(obj) &&
    !isNil(obj["cert"]) &&
    isString(obj["signature"]) &&
    obj.type === "GenerateRequest" &&
    isARPKICert({ ...obj["cert"], signatures: [] })
  );
};

export const isGenerateResponse = <C extends Certificate>(
  obj: any
): obj is GenerateResponse<C> => {
  return (
    isResponse(obj) &&
    isGenerateRequest(obj.request) &&
    isString(obj["certSignature"]) &&
    obj.type === "GenerateResponse"
  );
};
