import { Response, Request, SignedRequest } from "../types";
import { isString } from "../../util/guards";
import { isResponse, isRequest } from "../guards";
import { Certificate, MultiSignature } from "../../certs/types";
import { ModificationRequest, isModificationRequest } from "./Modification";
import { isMultiSignature } from "../../certs/guards";

export interface SynchronizationAcknowledge extends Response {
  type: "SynchronizationAcknowledge";
  acceptanceConfirmation: MultiSignature;
  consistencyProof: string;
  logProof: string;
  mapProof: string;
  root: string;
  rootSignature: MultiSignature;
  logProofSignature: string;
  mapProofSignature: string;
  consistencyProofSignature: string;
  request: SynchronizationCommit;
}

export interface SynchronizationRequest<C extends Certificate>
  extends SignedRequest {
  type: "SynchronizationRequest";
  request: ModificationRequest<C>;
}

export interface SynchronizationResponse<C extends Certificate>
  extends Response {
  type: "SynchronizationResponse";
  request: SynchronizationRequest<C>;
  hash: string;
}

export interface SynchronizationCommit extends SignedRequest {
  type: "SynchronizationCommit";
  acceptanceConfirmation: MultiSignature;
  hash: string;
}

export const isSynchronizationRequest = <C extends Certificate>(
  obj: any
): obj is SynchronizationRequest<C> => {
  return (
    isRequest(obj) &&
    isString(obj["signature"]) &&
    isModificationRequest(obj["request"]) &&
    obj.type === "SynchronizationRequest"
  );
};

export const isSynchronizationResponse = <C extends Certificate>(
  obj: any
): obj is SynchronizationResponse<C> => {
  return (
    isResponse(obj) &&
    isString(obj["hash"]) &&
    obj.type === "SynchronizationResponse"
  );
};

export const isSynchronizationCommit = (
  obj: any
): obj is SynchronizationCommit => {
  return (
    isRequest(obj) &&
    isString(obj["signature"]) &&
    isString(obj["hash"]) &&
    obj.type === "SynchronizationCommit"
  );
};

export const isSynchronizationAcknowledge = (
  obj: any
): obj is SynchronizationAcknowledge => {
  return (
    isResponse(obj) &&
    isString(obj["consistencyProof"]) &&
    isString(obj["consistencyProofSignature"]) &&
    isString(obj["logProof"]) &&
    isString(obj["logProofSignature"]) &&
    isString(obj["mapProof"]) &&
    isString(obj["mapProofSignature"]) &&
    isString(obj["root"]) &&
    isMultiSignature(obj["rootSignature"]) &&
    isMultiSignature(obj["acceptanceConfirmation"]) &&
    obj.type === "SynchronizationAcknowledge"
  );
};
