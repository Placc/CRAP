import { isString, isArrayOf } from "../../util/guards";
import { isNil } from "lodash";
import { isRequest, isResponse } from "../guards";
import { Response, Request } from "../types";
import { CertificateType } from "../../certs/types";
import { isCertificateType } from "../../certs/guards";

export interface RootRequest extends Request {
  type: "RootRequest";
  certType: CertificateType;
  ils: string;
  revision: string;
  oldRevision?: string;
}

export const isRootRequest = (obj: any): obj is RootRequest => {
  return (
    isRequest(obj) &&
    obj.type === "RootRequest" &&
    isString(obj["revision"]) &&
    isString(obj["ils"]) &&
    isCertificateType(obj["certType"]) &&
    (isNil(obj["oldRevision"]) || isString(obj["oldRevision"]))
  );
};

export interface RootResponse extends Response {
  type: "RootResponse";
  request: RootRequest;
  root: string;
  consistencyProof?: string;
  cas?: string[];
}

export const isRootResponse = (obj: any): obj is RootResponse => {
  return (
    isResponse(obj) &&
    obj.type === "RootResponse" &&
    isRootRequest(obj.request) &&
    (isNil(obj["cas"]) || isArrayOf<string>(obj["cas"], isString)) &&
    (isNil(obj["consistencyProof"]) || isString(obj["consistencyProof"]))
  );
};
