import {
  Certificate,
  CertificateType,
  ARPKICert,
  MultiSignature
} from "../../certs/types";
import { Request, Response } from "../types";
import { isNil } from "lodash";
import { isString } from "util";
import {
  isCertificateType,
  isMultiSignature,
  isARPKICert
} from "../../certs/guards";
import { isArrayOf } from "../../util/guards";
import { isRequest, isResponse } from "../guards";

export interface GetRequest extends Request {
  type: "GetRequest";
  domain: string;
  cas: string[];
  ils: string;
  certType: CertificateType;
}

export interface GetResponse<C extends Certificate> extends Response {
  type: "GetResponse";
  request: GetRequest;
  cert?: ARPKICert<C>;
  proof: string;
  proofSignature: string;
  root: string;
  rootSignature: MultiSignature;
}

export const isGetRequest = (obj: any): obj is GetRequest => {
  return (
    isRequest(obj) &&
    isString(obj["domain"]) &&
    isString(obj["ils"]) &&
    isArrayOf<string>(obj["cas"], isString) &&
    isCertificateType(obj["certType"]) &&
    obj.type === "GetRequest"
  );
};

export const isGetResponse = <C extends Certificate>(
  obj: any
): obj is GetResponse<C> => {
  return (
    isResponse(obj) &&
    isGetRequest(obj["request"]) &&
    (isNil(obj["cert"]) || isARPKICert(obj["cert"])) &&
    isString(obj["proof"]) &&
    isString(obj["proofSignature"]) &&
    isString(obj["root"]) &&
    isMultiSignature(obj["rootSignature"]) &&
    obj.type === "GetResponse"
  );
};

export const isValidGetRequestContent = (
  isValidCertType: (cert: CertificateType) => boolean
) => (obj: GetRequest) => Promise.resolve(isValidCertType(obj.certType));

export const isValidGetResponseContent = <C extends Certificate>(
  isValidCertType: (cert: CertificateType) => boolean,
  isValidCert: (cert: any) => Promise<boolean>
) => async (obj: GetResponse<C>) =>
  isValidCertType(obj.request.certType) && !isNil(obj.cert)
    ? await isValidCert(obj.cert)
    : true;
