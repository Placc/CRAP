import { CA, Participant, ILS } from "common/participants/types";
import { RequestHolder } from "./requestHolder";
import {
  AuditRequest,
  AuditResponse,
  isAuditResponse
} from "common/communication/requests/Audit";
import {
  CA_MIN,
  verifyParticipants,
  verifyMultiSignature,
  verifyNonceSignature
} from "common/certs/verification";
import { TreeRootDatabase } from "../db";
import { verify, sign } from "common/crypto/rsa";
import { isEqual } from "lodash";
import { CryptoKey } from "common/crypto/types";
import { resolveCurrentRoot } from "./Root";
import { parseMapRoot } from "common/trillian/parse";
import { stringify } from "common/util/funs";

export const processAuditRequest = (
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder
) => async (request: AuditRequest) => {
  verifyParticipants(ca, CA_MIN, request, request);

  const awaiter = requestHolder.newRequest(
    request,
    (res): res is AuditResponse => isAuditResponse(res)
  );

  const ils = (await queryParticipant(request.ils)) as ILS;
  await ils.send("audit", request);

  return awaiter;
};

export const processAuditResponse = (
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder
) => async (requester: ILS | CA, response: AuditResponse) => {
  verifyParticipants(ca, CA_MIN, response.request, response.request);

  const signingCAs = (await Promise.all(
    response.request.cas
      .slice(response.request.cas.indexOf(ca.url) + 1)
      .map(async ca => await queryParticipant(ca))
  )) as CA[];
  const ils = (await queryParticipant(response.request.ils)) as ILS;

  if (response.nonce != response.request.nonce) {
    throw new Error("Invalid nonce!");
  }

  const { nonceSignature, ...rawResponse } = response;
  if (!verifyNonceSignature(rawResponse, nonceSignature, signingCAs, ils)) {
    throw new Error("Invalid nonce signature!");
  }

  const leaves = JSON.parse(response.leaves);
  if (!verify(leaves, response.leavesSignature, ils.publicKey)) {
    throw new Error("Invalid leaves signature!");
  }

  const logProofs = JSON.parse(response.logProofs);
  if (!verify(logProofs, response.logProofsSignature, ils.publicKey)) {
    throw new Error("Invalid logProofs signature!");
  }

  const mapProofs = JSON.parse(response.mapProofs);
  if (!verify(mapProofs, response.mapProofsSignature, ils.publicKey)) {
    throw new Error("Invalid mapProofs signature!");
  }

  const consistencyProof = JSON.parse(response.consistencyProof);
  if (
    !verify(consistencyProof, response.consistencyProofSignature, ils.publicKey)
  ) {
    throw new Error("Invalid consistencyProof signature!");
  }

  const root = JSON.parse(response.root);
  if (!verifyMultiSignature(root, response.rootSignature, signingCAs, ils)) {
    throw new Error("Invalid root signature!");
  }

  const currentRoot = await resolveCurrentRoot(
    ca,
    response.root,
    ils,
    response.request.certType,
    queryParticipant,
    storage
  );

  if (!isEqual(currentRoot, parseMapRoot(response.root))) {
    throw new Error(
      `Invalid root! Current: ${stringify(currentRoot)}\nGot: ${stringify(
        root
      )}`
    );
  }

  const nextResponse: AuditResponse = {
    ...response,
    rootSignature: {
      data: response.rootSignature,
      signature: sign(response.rootSignature, privateKey)
    },
    nonceSignature: {
      data: response.nonceSignature,
      signature: sign(response.nonceSignature, privateKey)
    }
  };

  if (signingCAs.length + 1 < response.request.cas.length) {
    const nextCA = await queryParticipant(
      response.request.cas[response.request.cas.indexOf(ca.url) - 1]
    );
    await nextCA.send("audit", nextResponse);
  } else {
    requestHolder.notifyResult(response.request, nextResponse);
  }
};
