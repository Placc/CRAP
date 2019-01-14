import { Certificate, MultiSignature } from "common/certs/types";
import { Request, Response } from "common/communication/types";
import { ILS, CA, Participant } from "common/participants/types";
import { sign, verify } from "common/crypto/rsa";
import { getHash, stringify } from "common/util/funs";
import { modify } from "./modification";
import { head } from "lodash";
import { isString } from "common/util/guards";
import { verifyParticipants } from "common/certs/verification";
import { verifyNonExistence, verifyExistence } from "./verification";
import { ARPKICertStorage } from "../storage/types";
import { RequestQueue } from "./pending";
import { CryptoKey } from "common/crypto/types";
import {
  SynchronizationAcknowledge,
  SynchronizationRequest,
  SynchronizationCommit,
  SynchronizationResponse
} from "common/communication/requests/Synchronization";
import {
  ModificationRequest,
  isModificationRequest
} from "common/communication/requests/Modification";
import { isValidARPKICert } from "common/certs/validators";
import { isRegistrationRequest } from "common/communication/requests/Registration";
import { isUpdateRequest } from "common/communication/requests/Update";
import { isDeleteRequest } from "common/communication/requests/Delete";
import { fromValue } from "long";

export const isValidSyncContent = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => (obj: SynchronizationRequest<C>) => isValidCert(obj.request.cert);

export const isValidCommitContent = (_: SynchronizationCommit) =>
  Promise.resolve(true);

export const synchronize = async <C extends Certificate>(
  request: ModificationRequest<C>,
  confirmation: MultiSignature,
  privateKey: CryptoKey,
  ilses: ILS[]
) => {
  const hash = getHash(request);

  for (const ils of ilses) {
    const rawRequest = {
      type: "SynchronizationRequest",
      request,
      nonce: request.nonce
    };

    const syncRequest: SynchronizationRequest<C> = {
      ...rawRequest,
      type: "SynchronizationRequest",
      signature: sign(rawRequest, privateKey)
    };

    const { nonceSignature, ...rawResponse } = (await ils.send(
      "sync",
      syncRequest
    )) as SynchronizationResponse<C>;

    if (
      rawResponse.hash !== hash ||
      rawResponse.nonce !== syncRequest.nonce ||
      !verify(rawResponse, nonceSignature.signature, ils.publicKey)
    ) {
      throw new Error(`ILS ${ils} returned wrong SynResp!`);
    }
  }

  const synAcks = new Array<SynchronizationAcknowledge>();
  let acceptance = confirmation;

  for (const ils of ilses) {
    const rawCommit = {
      type: "SynchronizationCommit",
      hash,
      nonce: request.nonce
    };

    const syncCommit: SynchronizationCommit = {
      ...rawCommit,
      type: "SynchronizationCommit",
      acceptanceConfirmation: acceptance,
      signature: sign(rawCommit, privateKey)
    };

    const response = (await ils.send(
      "sync/commit",
      syncCommit
    )) as SynchronizationAcknowledge;

    synAcks.push(response);
    acceptance = response.acceptanceConfirmation;
  }

  return synAcks;
};

export const processSynchronizationRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  requestQueue: RequestQueue,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  requester: ILS,
  request: SynchronizationRequest<C>
): Promise<SynchronizationResponse<C>> => {
  const innerRequest = request.request;
  verifyParticipants(
    ils,
    innerRequest.cert.caMin,
    innerRequest.cert,
    innerRequest.cert
  );

  if (!(await isValidARPKICert(innerRequest.cert, queryParticipant))) {
    throw new Error("Invalid ARPKI properties!");
  }

  if (isRegistrationRequest(innerRequest)) {
    await verifyNonExistence(innerRequest.cert, storage);
  } else if (isUpdateRequest(innerRequest) || isDeleteRequest(innerRequest)) {
    await verifyExistence(innerRequest.cert, storage);
  }

  requestQueue.pushPending(innerRequest);

  const rawResponse = {
    type: "SynchronizationResponse",
    hash: getHash(innerRequest),
    nonce: request.nonce,
    request
  };
  const response: SynchronizationResponse<C> = {
    ...rawResponse,
    type: "SynchronizationResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  return response;
};

export const processSynchronizationCommit = <C extends Certificate>(
  privateKey: CryptoKey,
  requestQueue: RequestQueue,
  storage: ARPKICertStorage<C>
) => async (
  requester: ILS,
  request: SynchronizationCommit
): Promise<SynchronizationAcknowledge> => {
  const pending = requestQueue.popPending(request.hash);

  if (!isModificationRequest(pending.request)) {
    throw new Error("Pending request is not for modification!");
  }

  const root = await modify(pending.request, storage);
  const { consistencyProof, logProofs, mapProofs } = await storage.audit(
    fromValue(root.Revision)
      .sub(1)
      .toString()
  );
  const mapProof = head(mapProofs)!;
  const logProof = head(logProofs)!;

  const consistencyProofSignature = sign(consistencyProof, privateKey);
  const mapProofSignature = sign(mapProof, privateKey);
  const logProofSignature = sign(logProof, privateKey);
  const rootSignature = sign(root, privateKey);
  const confirmationSignature = sign(
    request.acceptanceConfirmation,
    privateKey
  );

  const rawAcknowledge = {
    type: "SynchronizationAcknowledge",
    root: stringify(root),
    consistencyProof: stringify(consistencyProof),
    consistencyProofSignature,
    logProof: stringify(logProof),
    logProofSignature,
    mapProof: stringify(mapProof),
    mapProofSignature,
    rootSignature: { signature: rootSignature },
    acceptanceConfirmation: {
      data: request.acceptanceConfirmation,
      signature: confirmationSignature
    },
    nonce: request.nonce,
    request
  };
  const acknowledge: SynchronizationAcknowledge = {
    ...rawAcknowledge,
    type: "SynchronizationAcknowledge",
    nonceSignature: {
      signature: sign(rawAcknowledge, privateKey)
    }
  };

  return acknowledge;
};
