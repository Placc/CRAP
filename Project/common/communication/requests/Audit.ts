import { CertificateType, MultiSignature } from "../../certs/types";
import { Request, Response } from "../types";
import { isNil } from "lodash";
import { isString, isArrayOf } from "../../util/guards";
import { isCertificateType, isMultiSignature } from "../../certs/guards";
import { isRequest, isResponse } from "../guards";

export interface AuditRequest extends Request {
  type: "AuditRequest";
  certType: CertificateType;
  cas: string[];
  ils: string;
  sinceRevision: string;
}

export interface AuditResponse extends Response {
  type: "AuditResponse";
  request: AuditRequest;
  leaves: string;
  logProofs: string;
  consistencyProof: string;
  mapProofs: string;
  root: string;
  leavesSignature: string;
  logProofsSignature: string;
  consistencyProofSignature: string;
  mapProofsSignature: string;
  rootSignature: MultiSignature;
}

export const isAuditRequest = (obj: any): obj is AuditRequest => {
  return (
    isRequest(obj) &&
    isCertificateType(obj["certType"]) &&
    isArrayOf<string>(obj["cas"], isString) &&
    isString(obj["ils"]) &&
    isString(obj["sinceRevision"]) &&
    obj.type === "AuditRequest"
  );
};

export const isAuditResponse = (obj: any): obj is AuditResponse => {
  return (
    isResponse(obj) &&
    isAuditRequest(obj["request"]) &&
    isString(obj["leaves"]) &&
    isString(obj["logProofs"]) &&
    isString(obj["consistencyProof"]) &&
    isString(obj["mapProofs"]) &&
    isString(obj["root"]) &&
    isString(obj["leavesSignature"]) &&
    isString(obj["logProofsSignature"]) &&
    isString(obj["consistencyProofSignature"]) &&
    isString(obj["mapProofsSignature"]) &&
    isMultiSignature(obj["rootSignature"]) &&
    obj.type === "AuditResponse"
  );
};

export const isValidAuditRequestContent = (
  isValidCertType: (cert: CertificateType) => boolean
) => (obj: AuditRequest) => Promise.resolve(isValidCertType(obj.certType));

export const isValidAuditResponseContent = (
  isValidCertType: (cert: CertificateType) => boolean
) => (obj: AuditResponse) =>
  Promise.resolve(isValidCertType(obj.request.certType));
