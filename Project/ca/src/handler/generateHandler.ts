import {
  Certificate,
  ApplicationCertificate,
  PublisherCertificate,
  AuditionCertificate
} from "common/certs/types";
import {
  Server,
  ParticipantHandler,
  ProtocolHandler
} from "common/communication/types";
import {
  isGenerateRequest,
  GenerateRequest
} from "common/communication/requests/Generate";
import {
  isValidGenerateRequest,
  processGenerateRequest
} from "../requests/Generate";
import { isPublisher, isAuditor } from "common/participants/guards";
import {
  isValidAuditionCertificate,
  isValidApplicationCertificate,
  isValidPublisherCertificate
} from "common/certs/validators";
import { createQueryCertificateHandler } from "./queryCertificate";
import { CA, Publisher, Auditor } from "common/participants/types";
import { CryptoKey } from "common/crypto/types";

export const createGenerateHandlers = (
  thisCA: CA,
  privateKey: CryptoKey,
  participantHandler: ParticipantHandler
) => {
  const queryApplicationCertificate = createQueryCertificateHandler<
    ApplicationCertificate
  >(
    thisCA.url,
    privateKey,
    participantHandler.executeLookupRequest,
    "ApplicationCertificate"
  );
  const queryPublisherCertificate = createQueryCertificateHandler<
    PublisherCertificate
  >(
    thisCA.url,
    privateKey,
    participantHandler.executeLookupRequest,
    "PublisherCertificate"
  );

  const validAudition = (cas: string[], ilses: string[]) =>
    isValidAuditionCertificate(
      queryApplicationCertificate(cas, ilses),
      queryPublisherCertificate(cas, ilses),
      participantHandler.executeLookupRequest,
      true
    );
  const validApplication = (cas: string[], ilses: string[]) =>
    isValidApplicationCertificate(
      queryPublisherCertificate(cas, ilses),
      participantHandler.executeLookupRequest,
      true
    );
  const validPublisher = (cas: string[], ilses: string[]) =>
    isValidPublisherCertificate(
      queryPublisherCertificate(cas, ilses),
      participantHandler.executeLookupRequest,
      false,
      true
    );

  const validModifier = (requester): requester is Publisher | Auditor => {
    return isPublisher(requester) || isAuditor(requester);
  };

  return [
    {
      handle: processGenerateRequest(thisCA, privateKey),
      validRequest: (obj: any): obj is GenerateRequest<Certificate> =>
        isGenerateRequest(obj),
      validSender: validModifier,
      validContent: (req: GenerateRequest<Certificate>) =>
        isValidGenerateRequest(validPublisher(req.cert.cas!, req.cert.ilses!))(
          req
        )
    },
    {
      handle: processGenerateRequest(thisCA, privateKey),
      validRequest: (obj: any): obj is GenerateRequest<Certificate> =>
        isGenerateRequest(obj),
      validSender: validModifier,
      validContent: (req: GenerateRequest<Certificate>) =>
        isValidGenerateRequest(
          validApplication(req.cert.cas!, req.cert.ilses!)
        )(req)
    },
    {
      handle: processGenerateRequest(thisCA, privateKey),
      validRequest: (obj: any): obj is GenerateRequest<Certificate> =>
        isGenerateRequest(obj),
      validSender: validModifier,
      validContent: (req: GenerateRequest<Certificate>) =>
        isValidGenerateRequest(validAudition(req.cert.cas!, req.cert.ilses!))(
          req
        )
    }
  ];
};
