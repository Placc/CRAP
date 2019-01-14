import { isNil } from "lodash";
import { isMultiSignature } from "../certs/guards";
import { isString, isNumber } from "../util/guards";
import { Request, Response, SignedRequest } from "./types";

export function isRequest(obj: any): obj is Request {
  return (
    !isNil(obj) &&
    isString(obj.type) &&
    isNumber(obj.nonce) &&
    (obj.type == "SynchronizationRequest" ||
      obj.type == "SynchronizationCommit" ||
      obj.type == "RegistrationRequest" ||
      obj.type == "UpdateRequest" ||
      obj.type == "DeleteRequest" ||
      obj.type == "GetRequest" ||
      obj.type == "AuditRequest" ||
      obj.type == "GenerateRequest" ||
      obj.type == "GetSignatureRequest")
  );
}

export function isSignedRequest(obj: any): obj is SignedRequest {
  return isRequest(obj) && isString(obj["signature"]);
}

export function isResponse(obj: any): obj is Response {
  return (
    !isNil(obj) &&
    isString(obj.type) &&
    isNumber(obj.nonce) &&
    isRequest(obj.request) &&
    isMultiSignature(obj.nonceSignature) &&
    (obj.type == "RegistrationResponse" ||
      obj.type == "SynchronizationResponse" ||
      obj.type == "SynchronizationAcknowledge" ||
      obj.type == "UpdateResponse" ||
      obj.type == "DeleteResponse" ||
      obj.type == "GetResponse" ||
      obj.type == "AuditResponse" ||
      obj.type == "GenerateResponse" ||
      obj.type == "GetSignatureResponse")
  );
}
