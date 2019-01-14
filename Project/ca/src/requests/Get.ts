import { Participant, CA, ILS } from "common/participants/types";
import { RequestHolder } from "./requestHolder";
import {
  GetRequest,
  GetResponse,
  isGetResponse
} from "common/communication/requests/Get";
import {
  CA_MIN,
  verifyParticipants,
  verifyMultiSignature,
  verifyNonceSignature
} from "common/certs/verification";
import { Certificate } from "common/certs/types";
import { TreeRootDatabase } from "../db";
import { getCertDomain, stringify } from "common/util/funs";
import { verify, sign } from "common/crypto/rsa";
import { isEqual, isObject, transform } from "lodash";
import { CryptoKey } from "common/crypto/types";
import { resolveCurrentRoot } from "./Root";
import { parseMapRoot } from "common/trillian/parse";

export const processGetRequest = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder
) => async (request: GetRequest) => {
  verifyParticipants(ca, CA_MIN, request, request);

  const awaiter = requestHolder.newRequest(
    request,
    (res): res is GetResponse<C> => isGetResponse<C>(res)
  );

  const ils = (await queryParticipant(request.ils)) as ILS;
  await ils.send("get", request);

  return awaiter;
};

export const isValidGetResponse = <C extends Certificate>(
  isValidCert: (cert: C) => Promise<boolean>
) => async (response: GetResponse<C>) => {
  if (response.cert) {
    if (response.cert.type != response.request.certType) {
      throw new Error("Invalid cert type!");
    }
    if (getCertDomain(response.cert) !== response.request.domain) {
      throw new Error("Invalid cert domain!");
    }
    if (!(await isValidCert(response.cert))) {
      throw new Error("Invalid certificate!");
    }
  }
};

export const processGetResponse = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder
) => async (requester: ILS | CA, response: GetResponse<C>) => {
  const caMin = response.cert ? response.cert.caMin : CA_MIN;
  const superset = response.cert || response.request;
  verifyParticipants(ca, caMin, response.request, superset);

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

  const proof = JSON.parse(response.proof);
  if (!verify(proof, response.proofSignature, ils.publicKey)) {
    throw new Error("Invalid proof signature!");
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

  const nextResponse: GetResponse<C> = {
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
    await nextCA.send("get", nextResponse);
  } else {
    requestHolder.notifyResult(response.request, nextResponse);
  }
};
