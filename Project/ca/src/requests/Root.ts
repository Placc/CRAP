import { Participant, ILS, CA } from "common/participants/types";
import { RootRequest, RootResponse } from "common/communication/requests/Root";
import { TreeRootDatabase } from "../db";
import { stringify, CreateNonce } from "common/util/funs";
import { sign, verify } from "common/crypto/rsa";
import { CryptoKey } from "common/crypto/types";
import { parseMapRoot, parseProof } from "common/trillian/parse";
import { VerifyRoot } from "common/trillian/verification/logVerifier";
import { verifyNonceSignature } from "common/certs/verification";
import { CertificateType } from "common/certs/types";
import { isEqual, isEmpty } from "lodash";
import { MapRootV1, Proof } from "common/trillian/types";
import { fromValue } from "long";

export const isValidRootRequest = (
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase
) => async (request: RootRequest) => {
  try {
    const ils = (await queryParticipant(request.ils)) as ILS;

    const version = await storage.latestRevision(ils, request.certType);
    return version == parseInt(request.revision);
  } catch {
    return false;
  }
};

export const processRootRequest = (
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase
) => async (_s: Participant, request: RootRequest, _r: Participant) => {
  const ils = (await queryParticipant(request.ils)) as ILS;

  const root = await storage.get(ils, request.certType, request.revision);

  const rawResponse = {
    type: "RootResponse",
    nonce: request.nonce,
    request: request,
    root: stringify(root)
  };

  const response: RootResponse = {
    ...rawResponse,
    type: "RootResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  return response;
};

const verifyCARoot = async (
  ca: CA,
  root: MapRootV1,
  ils: ILS,
  certType: CertificateType
) => {
  const request: RootRequest = {
    type: "RootRequest",
    certType,
    ils: ils.url,
    nonce: CreateNonce(),
    revision: root.Revision
  };

  const response = (await ca.send("root", request)) as RootResponse;

  const { nonceSignature, ...rawResponse } = response;
  if (!verify(rawResponse, nonceSignature.signature, ca.publicKey)) {
    throw new Error("Invalid RootResponse signature (CA)!");
  }

  const caRoot = parseMapRoot(response.root);

  if (!isEqual(caRoot, root)) {
    throw new Error("CA root not equal!");
  }
};

const requestRoot = async (
  ils: ILS,
  thisCA: CA,
  certType: CertificateType,
  currentRoot: MapRootV1,
  resRootRevision: string,
  storage: TreeRootDatabase,
  queryParticipant: (url: string) => Promise<Participant>
) => {
  if (resRootRevision == currentRoot.Revision) {
    return currentRoot;
  }

  const rootRequest: RootRequest = {
    type: "RootRequest",
    certType,
    ils: ils.url,
    oldRevision: currentRoot.Revision,
    revision: resRootRevision,
    nonce: CreateNonce()
  };

  const response = (await ils.send("root", rootRequest)) as RootResponse;

  const { nonceSignature, ...rawResponse } = response;
  if (!verify(rawResponse, nonceSignature.signature, ils.publicKey)) {
    throw new Error("Invalid RootResponse signature (ILS)!");
  }

  if (!response.cas || isEmpty(response.cas)) {
    throw new Error("Illegal CAs list in RootResponse!");
  }
  if (response.cas.some(ca => ca == thisCA.url)) {
    throw new Error("Illegal CA in CAs list of RootResponse (self)!");
  }

  const newRoot = parseMapRoot(response.root);

  const cas = (await Promise.all(
    response.cas.map(async ca => await queryParticipant(ca))
  )) as CA[];

  await Promise.all(
    cas.map(async ca => await verifyCARoot(ca, newRoot, ils, certType))
  );

  const consistencyProof = parseProof(response.consistencyProof!);
  await VerifyRoot(
    currentRoot.LogRoot,
    newRoot.LogRoot,
    consistencyProof.hashesList
  );

  await storage.set(ils, certType, newRoot);

  return newRoot;
};

export const resolveCurrentRoot = async (
  thisCA: CA,
  responseRoot: string,
  ils: ILS,
  certType: CertificateType,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  consistency?: string
) => {
  const dbRoot = await storage.get(ils, certType);
  const resRoot = parseMapRoot(responseRoot);
  const currentRoot = parseMapRoot(stringify(dbRoot));

  if (fromValue(resRoot.Revision).lt(currentRoot.Revision)) {
    throw new Error(
      "Invalid ILS RootResponse: Root Revision less than current!"
    );
  }

  if (fromValue(resRoot.Revision).eq(currentRoot.Revision)) {
    if (consistency) {
      throw new Error(
        "Invalid ILS Root Response: Consistency although roots equal"
      );
    }
    return currentRoot;
  }

  if (!consistency) {
    const correctRoot = await requestRoot(
      ils,
      thisCA,
      certType,
      currentRoot,
      resRoot.Revision,
      storage,
      queryParticipant
    );

    if (fromValue(correctRoot.Revision).neq(resRoot.Revision)) {
      throw new Error("Invalid Root Revision!");
    }

    return correctRoot;
  } else {
    const consistencyProof = parseProof(consistency);

    try {
      await VerifyRoot(
        currentRoot.LogRoot,
        resRoot.LogRoot,
        consistencyProof.hashesList
      );

      return resRoot;
    } catch {
      const correctRoot = await requestRoot(
        ils,
        thisCA,
        certType,
        currentRoot,
        resRoot.Revision,
        storage,
        queryParticipant
      );

      await VerifyRoot(
        currentRoot.LogRoot,
        correctRoot.LogRoot,
        consistencyProof.hashesList
      );

      return correctRoot;
    }
  }
};
