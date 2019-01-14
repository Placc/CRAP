import { Certificate } from "../../certs/types";
import {
  ModificationResponse,
  ModificationRequest,
  isModificationRequest,
  isModificationResponse
} from "./Modification";

export interface UpdateRequest<C extends Certificate>
  extends ModificationRequest<C> {
  type: "UpdateRequest";
}

export interface UpdateResponse<C extends Certificate>
  extends ModificationResponse<C> {
  type: "UpdateResponse";
}

export const isUpdateRequest = <C extends Certificate>(
  obj: any
): obj is UpdateRequest<C> => {
  return isModificationRequest(obj) && obj.type === "UpdateRequest";
};

export const isUpdateResponse = <C extends Certificate>(
  obj: any
): obj is UpdateResponse<C> => {
  return isModificationResponse(obj) && obj.type === "UpdateResponse";
};

export const isValidUpdateRequestContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: UpdateRequest<C>) => isValidCert(obj.cert);

export const isValidUpdateResponseContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: UpdateResponse<C>) => isValidCert(obj.request.cert);
