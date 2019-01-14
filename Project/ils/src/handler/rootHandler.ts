import { CA, Participant, ILS, ILSInfo } from "common/participants/types";
import {
  RootRequest,
  isRootRequest,
  RootResponse
} from "common/communication/requests/Root";
import { isParticipant } from "common/participants/guards";
import { ParticipantHandler } from "common/communication/types";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";
import { stringify } from "common/util/funs";
import { processRootRequest, isValidRootRequest } from "../requests/Root";
import { StorageService } from "../storage";

export const createRootHandler = (
  thisILS: ILSInfo,
  privateKey: CryptoKey,
  storage: StorageService
) => {
  const processPublisher = processRootRequest(
    privateKey,
    storage.getPublisherStorage()
  );

  const processApplication = processRootRequest(
    privateKey,
    storage.getApplicationStorage()
  );

  const processAudition = processRootRequest(
    privateKey,
    storage.getAuditionStorage()
  );

  const validPublisherRootRequest = async (request: RootRequest) => {
    return (
      request.certType == "PublisherCertificate" &&
      isValidRootRequest(thisILS)(request)
    );
  };

  const validApplicationRootRequest = async (request: RootRequest) => {
    return (
      request.certType == "ApplicationCertificate" &&
      isValidRootRequest(thisILS)(request)
    );
  };

  const validAuditionRootRequest = async (request: RootRequest) => {
    return (
      request.certType == "AuditionCertificate" &&
      isValidRootRequest(thisILS)(request)
    );
  };

  return [
    {
      handle: processPublisher,
      validRequest: isRootRequest,
      validSender: isParticipant,
      validContent: validPublisherRootRequest
    },
    {
      handle: processApplication,
      validRequest: isRootRequest,
      validSender: isParticipant,
      validContent: validApplicationRootRequest
    },
    {
      handle: processAudition,
      validRequest: isRootRequest,
      validSender: isParticipant,
      validContent: validAuditionRootRequest
    }
  ];
};
