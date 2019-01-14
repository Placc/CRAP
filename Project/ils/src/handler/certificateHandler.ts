import { CertificateRequestHandler } from "common/communication/types";
import { processRegistrationRequest } from "../requests/Registration";
import { ILS, Publisher, CA } from "common/participants/types";
import { Certificate, CertificateType } from "common/certs/types";
import { processUpdateRequest } from "../requests/Update";
import { processGetRequest } from "../requests/Get";
import {
  isGetRequest,
  isValidGetRequestContent
} from "common/communication/requests/Get";
import { processAuditRequest } from "../requests/Audit";
import { ARPKICertStorage } from "../storage/types";
import { processDeleteRequest } from "../requests/Delete";
import { isCA } from "common/participants/guards";
import { ParticipantHandler, Server } from "common/communication/types";
import {
  RegistrationRequest,
  isRegistrationRequest,
  isValidRegistrationRequestContent
} from "common/communication/requests/Registration";
import {
  UpdateRequest,
  isUpdateRequest,
  isValidUpdateRequestContent
} from "common/communication/requests/Update";
import {
  DeleteRequest,
  isDeleteRequest,
  isValidDeleteRequestContent
} from "common/communication/requests/Delete";
import {
  isAuditRequest,
  isValidAuditRequestContent
} from "common/communication/requests/Audit";

export const createCertificateHandler = <C extends Certificate>(
  server: Server,
  thisILS: ILS,
  participantHandler: ParticipantHandler
) => (
  certType: CertificateType,
  storage: ARPKICertStorage<C>,
  validCert: (cert: Certificate) => Promise<boolean>,
  validType: (certType: CertificateType) => boolean
): CertificateRequestHandler<CA, C> => {
  const registrationRequest = processRegistrationRequest(
    thisILS,
    server.privateKey,
    storage,
    participantHandler.executeLookupRequest
  );

  const updateRequest = processUpdateRequest(
    thisILS,
    server.privateKey,
    storage,
    participantHandler.executeLookupRequest
  );

  const getRequest = processGetRequest(
    thisILS,
    server.privateKey,
    storage,
    participantHandler.executeLookupRequest
  );

  const proofRequest = processAuditRequest(
    thisILS,
    server.privateKey,
    storage,
    participantHandler.executeLookupRequest
  );

  const deleteRequest = processDeleteRequest(
    thisILS,
    server.privateKey,
    storage,
    participantHandler.executeLookupRequest
  );

  const isRegRequest = (obj: any): obj is RegistrationRequest<C> =>
    isRegistrationRequest<C>(obj);
  const isUpdRequest = (obj: any): obj is UpdateRequest<C> =>
    isUpdateRequest<C>(obj);
  const isDelRequest = (obj: any): obj is DeleteRequest<C> =>
    isDeleteRequest<C>(obj);

  return {
    certType,
    handleGetRequest: {
      validSender: isCA,
      validRequest: isGetRequest,
      handle: getRequest,
      validContent: isValidGetRequestContent(validType)
    },
    handleRegistrationRequest: {
      validSender: isCA,
      validRequest: isRegRequest,
      handle: registrationRequest,
      validContent: isValidRegistrationRequestContent(validCert)
    },
    handleUpdateRequest: {
      validSender: isCA,
      validRequest: isUpdRequest,
      handle: updateRequest,
      validContent: isValidUpdateRequestContent(validCert)
    },
    handleAuditRequest: {
      validSender: isCA,
      validRequest: isAuditRequest,
      handle: proofRequest,
      validContent: isValidAuditRequestContent(validType)
    },
    handleDeleteRequest: {
      validSender: isCA,
      validRequest: isDelRequest,
      handle: deleteRequest,
      validContent: isValidDeleteRequestContent(validCert)
    }
  };
};

export default createCertificateHandler;
