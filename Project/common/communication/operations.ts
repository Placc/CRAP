import { head, zip } from "lodash";
import { RequestType } from "./types";
import { ARPKICert, Certificate, RegisteredCert } from "../certs/types";
import { CA, ILS } from "../participants/types";
import { CreateNonce } from "../util/funs";
import { sign, verify } from "../crypto/rsa";
import {
  verifyMultiSignature,
  verifyNonceSignature,
  verifyAcceptanceConfirmation
} from "../certs/verification";
import { CryptoKey } from "../crypto/types";
import { GenerateRequest, GenerateResponse } from "./requests/Generate";
import {
  ModificationRequest,
  ModificationResponse
} from "./requests/Modification";

export const generateCertificate = async <C extends Certificate>(
  cas: CA[],
  cert: Partial<ARPKICert<C>>,
  privateKey: CryptoKey
): Promise<ARPKICert<C>> => {
  const rawRequest = {
    type: "GenerateRequest",
    nonce: CreateNonce(),
    cert
  };
  const generateRequest: GenerateRequest<C> = {
    ...rawRequest,
    type: "GenerateRequest",
    signature: sign(rawRequest, privateKey)
  };

  const responses = (await Promise.all(
    cas.map(async ca => await ca.send("generate", generateRequest))
  )) as GenerateResponse<C>[];

  if (responses.some(response => response.nonce != generateRequest.nonce)) {
    throw new Error("Invalid response nonce!");
  }
  const nonceSignaturesValid = zip(responses, cas).every(([response, ca]) => {
    const { nonceSignature, ...rawResponse } = response!;
    return verify(rawResponse, nonceSignature.signature, ca!.publicKey);
  });
  if (!nonceSignaturesValid) {
    throw new Error("Invalid response nonce signature!");
  }

  const signatures = responses.map(response => response.certSignature);

  return {
    ...(cert as any),
    signatures
  };
};

export const modifyCertificate = async <C extends Certificate>(
  endpoint: string,
  cas: CA[],
  ilses: ILS[],
  cert: ARPKICert<C>,
  privateKey: CryptoKey
): Promise<RegisteredCert<C>> => {
  let requestType: RequestType;
  switch (endpoint) {
    case "register":
      requestType = "RegistrationRequest";
      break;
    case "update":
      requestType = "UpdateRequest";
      break;
    case "delete":
      requestType = "DeleteRequest";
      break;
    default:
      throw new Error("Unrecognized modification endpoint!");
  }

  const rawRequest = {
    type: requestType,
    nonce: CreateNonce(),
    cert
  };
  const registrationRequest: ModificationRequest<C> = {
    ...rawRequest,
    type: requestType,
    signature: sign(rawRequest, privateKey)
  };

  const registrationResponse = (await head(cas)!.send(
    endpoint,
    registrationRequest
  )) as ModificationResponse<C>;

  if (registrationResponse.nonce != registrationRequest.nonce) {
    throw new Error("Invalid response nonce!");
  }

  const { nonceSignature, ...rawResponse } = registrationResponse;
  if (!verifyNonceSignature(rawResponse, nonceSignature, cas, head(ilses)!)) {
    throw new Error("Invalid response nonce signature!");
  }

  if (
    !verifyAcceptanceConfirmation(
      cert,
      registrationResponse.acceptanceConfirmation,
      cas,
      ilses
    )
  ) {
    throw new Error("Received invalid acceptance confirmation!");
  }

  const registeredCert: RegisteredCert<C> = {
    ...(cert as any),
    acceptanceConfirmation: registrationResponse.acceptanceConfirmation
  };

  return registeredCert;
};
