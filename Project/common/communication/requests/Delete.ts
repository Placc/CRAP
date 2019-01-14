import { Certificate, CertificateType } from "../../certs/types";
import {
  ModificationRequest,
  ModificationResponse,
  isModificationRequest,
  isModificationResponse
} from "./Modification";

export interface DeleteRequest<C extends Certificate>
  extends ModificationRequest<C> {
  type: "DeleteRequest";
}

export interface DeleteResponse<C extends Certificate>
  extends ModificationResponse<C> {
  type: "DeleteResponse";
}

export const isDeleteRequest = <C extends Certificate>(
  obj: any
): obj is DeleteRequest<C> => {
  return isModificationRequest(obj) && obj.type === "DeleteRequest";
};

export const isDeleteResponse = <C extends Certificate>(
  obj: any
): obj is DeleteResponse<C> => {
  return isModificationResponse(obj) && obj.type === "DeleteResponse";
};

export const isValidDeleteRequestContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: DeleteRequest<C>) => isValidCert(obj.cert);

export const isValidDeleteResponseContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: DeleteResponse<C>) => isValidCert(obj.request.cert);
