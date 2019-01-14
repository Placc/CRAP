import { Certificate } from "../../certs/types";
import {
  ModificationRequest,
  ModificationResponse,
  isModificationRequest,
  isModificationResponse
} from "./Modification";

export interface RegistrationRequest<C extends Certificate>
  extends ModificationRequest<C> {
  type: "RegistrationRequest";
}

export interface RegistrationResponse<C extends Certificate>
  extends ModificationResponse<C> {
  type: "RegistrationResponse";
}

export const isRegistrationRequest = <C extends Certificate>(
  obj: any
): obj is RegistrationRequest<C> => {
  return isModificationRequest(obj) && obj.type === "RegistrationRequest";
};

export const isRegistrationResponse = <C extends Certificate>(
  obj: any
): obj is RegistrationResponse<C> => {
  return isModificationResponse(obj) && obj.type === "RegistrationResponse";
};

export const isValidRegistrationRequestContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: RegistrationRequest<C>) => isValidCert(obj.cert);

export const isValidRegistrationResponseContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: RegistrationResponse<C>) => isValidCert(obj.request.cert);
