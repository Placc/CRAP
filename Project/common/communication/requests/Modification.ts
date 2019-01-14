import { Certificate, ARPKICert, MultiSignature } from "../../certs/types";
import {
  SynchronizationAcknowledge,
  isSynchronizationAcknowledge
} from "./Synchronization";
import { Request, Response, SignedRequest } from "../types";
import { isARPKICert, isMultiSignature } from "../../certs/guards";
import { isNil } from "lodash";
import { isArrayOf, isString } from "../../util/guards";
import { isRequest, isResponse } from "../guards";

export interface ModificationRequest<C extends Certificate>
  extends SignedRequest {
  cert: ARPKICert<C>;
}

export interface ModificationResponse<C extends Certificate> extends Response {
  acceptanceConfirmation: MultiSignature;
  consistencyProof: string;
  logProof: string;
  mapProof: string;
  root: string;
  rootSignature: MultiSignature;
  logProofSignature: string;
  mapProofSignature: string;
  consistencyProofSignature: string;
  request: ModificationRequest<C>;
  acknowledgements: SynchronizationAcknowledge[];
}

export const isModificationRequestType = (obj: any) => {
  return (
    obj === "DeleteRequest" ||
    obj === "RegistrationRequest" ||
    obj === "UpdateRequest"
  );
};

export const isModificationResponseType = (obj: any) => {
  return (
    obj === "DeleteResponse" ||
    obj === "RegistrationResponse" ||
    obj === "UpdateResponse"
  );
};

export const isModificationRequest = <C extends Certificate>(
  obj: any
): obj is ModificationRequest<C> => {
  return (
    isRequest(obj) &&
    isString(obj["signature"]) &&
    isARPKICert(obj["cert"]) &&
    isModificationRequestType(obj.type)
  );
};

export const isModificationResponse = <C extends Certificate>(
  obj: any
): obj is ModificationResponse<C> => {
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
    isModificationRequest<C>(obj["request"]) &&
    isArrayOf<SynchronizationAcknowledge>(
      obj["acknowledgements"],
      isSynchronizationAcknowledge
    ) &&
    isModificationResponseType(obj.type)
  );
};
