import {
  CertificateRequestHandler,
  CertificateResponseHandler
} from "common/communication/types";
import {
  processRegistrationRequest,
  processRegistrationResponse
} from "../requests/Registration";
import { ILS, Publisher, CA, Auditor } from "common/participants/types";
import { Certificate, CertificateType, ARPKICert } from "common/certs/types";
import {
  processUpdateRequest,
  processUpdateResponse
} from "../requests/Update";
import { processGetRequest, processGetResponse } from "../requests/Get";
import {
  isGetRequest,
  isValidGetRequestContent,
  isGetResponse,
  GetResponse,
  isValidGetResponseContent
} from "common/communication/requests/Get";
import { processAuditRequest, processAuditResponse } from "../requests/Audit";
import {
  processDeleteRequest,
  processDeleteResponse
} from "../requests/Delete";
import {
  isCA,
  isPublisher,
  isILS,
  isAuditor
} from "common/participants/guards";
import { ParticipantHandler, Server } from "common/communication/types";
import {
  RegistrationRequest,
  isRegistrationRequest,
  isValidRegistrationRequestContent,
  RegistrationResponse,
  isRegistrationResponse,
  isValidRegistrationResponseContent
} from "common/communication/requests/Registration";
import {
  UpdateRequest,
  isUpdateRequest,
  isValidUpdateRequestContent,
  UpdateResponse,
  isUpdateResponse,
  isValidUpdateResponseContent
} from "common/communication/requests/Update";
import {
  DeleteRequest,
  isDeleteRequest,
  isValidDeleteRequestContent,
  DeleteResponse,
  isDeleteResponse,
  isValidDeleteResponseContent
} from "common/communication/requests/Delete";
import {
  isAuditRequest,
  isValidAuditRequestContent,
  isAuditResponse,
  isValidAuditResponseContent
} from "common/communication/requests/Audit";
import { TreeRootDatabase } from "../db";
import { RequestHolder } from "../requests/requestHolder";

export const createRequestHandler = <C extends Certificate>(
  thisCA: CA,
  requestHolder: RequestHolder,
  participantHandler: ParticipantHandler
) => (
  certType: CertificateType,
  validCert: (cert: ARPKICert<C>) => Promise<boolean>,
  validType: (certType: CertificateType) => boolean
): CertificateRequestHandler<Publisher | Auditor, C> => {
  const registrationRequest = processRegistrationRequest(
    thisCA,
    participantHandler.executeLookupRequest,
    requestHolder
  );

  const updateRequest = processUpdateRequest(
    thisCA,
    participantHandler.executeLookupRequest,
    requestHolder
  );

  const getRequest = processGetRequest(
    thisCA,
    participantHandler.executeLookupRequest,
    requestHolder
  );

  const proofRequest = processAuditRequest(
    thisCA,
    participantHandler.executeLookupRequest,
    requestHolder
  );

  const deleteRequest = processDeleteRequest(
    thisCA,
    participantHandler.executeLookupRequest,
    requestHolder
  );

  const isRegRequest = (obj: any): obj is RegistrationRequest<C> =>
    isRegistrationRequest<C>(obj);
  const isUpdRequest = (obj: any): obj is UpdateRequest<C> =>
    isUpdateRequest<C>(obj);
  const isDelRequest = (obj: any): obj is DeleteRequest<C> =>
    isDeleteRequest<C>(obj);

  const validModifier = (requester): requester is Publisher | Auditor => {
    return isPublisher(requester) || isAuditor(requester);
  };

  return {
    certType,
    handleGetRequest: {
      validRequest: isGetRequest,
      handle: getRequest,
      validContent: isValidGetRequestContent(validType)
    },
    handleRegistrationRequest: {
      validSender: validModifier,
      validRequest: isRegRequest,
      handle: registrationRequest,
      validContent: isValidRegistrationRequestContent(validCert)
    },
    handleUpdateRequest: {
      validSender: validModifier,
      validRequest: isUpdRequest,
      handle: updateRequest,
      validContent: isValidUpdateRequestContent(validCert)
    },
    handleAuditRequest: {
      validRequest: isAuditRequest,
      handle: proofRequest,
      validContent: isValidAuditRequestContent(validType)
    },
    handleDeleteRequest: {
      validSender: validModifier,
      validRequest: isDelRequest,
      handle: deleteRequest,
      validContent: isValidDeleteRequestContent(validCert)
    }
  };
};

export const createResponseHandler = <C extends Certificate>(
  server: Server,
  thisCA: CA,
  requestHolder: RequestHolder,
  storage: TreeRootDatabase,
  participantHandler: ParticipantHandler
) => (
  certType: CertificateType,
  validCert: (cert: ARPKICert<C>) => Promise<boolean>,
  validType: (certType: CertificateType) => boolean
): CertificateResponseHandler<CA | ILS, C> => {
  const registrationRequest = processRegistrationResponse(
    thisCA,
    participantHandler.executeLookupRequest,
    storage,
    server.privateKey,
    requestHolder
  );

  const updateRequest = processUpdateResponse(
    thisCA,
    participantHandler.executeLookupRequest,
    storage,
    server.privateKey,
    requestHolder
  );

  const getRequest = processGetResponse(
    thisCA,
    participantHandler.executeLookupRequest,
    storage,
    server.privateKey,
    requestHolder
  );

  const proofRequest = processAuditResponse(
    thisCA,
    participantHandler.executeLookupRequest,
    storage,
    server.privateKey,
    requestHolder
  );

  const deleteRequest = processDeleteResponse(
    thisCA,
    participantHandler.executeLookupRequest,
    storage,
    server.privateKey,
    requestHolder
  );

  const isCAorILS = (obj: any): obj is CA | ILS => isCA(obj) || isILS(obj);

  const isGetRes = (obj: any): obj is GetResponse<C> => isGetResponse<C>(obj);
  const isRegResponse = (obj: any): obj is RegistrationResponse<C> =>
    isRegistrationResponse<C>(obj);
  const isUpdResponse = (obj: any): obj is UpdateResponse<C> =>
    isUpdateResponse<C>(obj);
  const isDelResponse = (obj: any): obj is DeleteResponse<C> =>
    isDeleteResponse<C>(obj);

  return {
    certType,
    handleGetResponse: {
      validSender: isCAorILS,
      validRequest: isGetRes,
      handle: getRequest,
      validContent: isValidGetResponseContent(validType, validCert)
    },
    handleRegistrationResponse: {
      validSender: isCAorILS,
      validRequest: isRegResponse,
      handle: registrationRequest,
      validContent: isValidRegistrationResponseContent(validCert)
    },
    handleUpdateResponse: {
      validSender: isCAorILS,
      validRequest: isUpdResponse,
      handle: updateRequest,
      validContent: isValidUpdateResponseContent(validCert)
    },
    handleAuditResponse: {
      validSender: isCAorILS,
      validRequest: isAuditResponse,
      handle: proofRequest,
      validContent: isValidAuditResponseContent(validType)
    },
    handleDeleteResponse: {
      validSender: isCAorILS,
      validRequest: isDelResponse,
      handle: deleteRequest,
      validContent: isValidDeleteResponseContent(validCert)
    }
  };
};
