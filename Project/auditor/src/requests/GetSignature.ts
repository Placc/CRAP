import {
  GetSignatureRequest,
  GetSignatureResponse
} from "common/communication/requests/GetSignature";
import { CertDatabase } from "../db";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";

export const processGetSignatureRequest = (
  privateKey: CryptoKey,
  storage: CertDatabase
) => async (request: GetSignatureRequest): Promise<GetSignatureResponse> => {
  const certificate = await storage.getAuditionCert(
    request.applicationUrl,
    request.deploymentVersion
  );

  const rawResponse = {
    type: "GetSignatureResponse",
    acceptanceConfirmation: certificate
      ? {
          data: certificate.acceptanceConfirmation,
          signature: sign(certificate.acceptanceConfirmation, privateKey)
        }
      : undefined,
    cas: certificate ? certificate.cas : undefined,
    ilses: certificate ? certificate.ilses : undefined,
    nonce: request.nonce,
    request
  };
  const response: GetSignatureResponse = {
    ...rawResponse,
    type: "GetSignatureResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  return response;
};
