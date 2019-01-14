import { RequestHolder } from "./requestHolder";
import {
  CA,
  Participant,
  Publisher,
  ILS,
  TreeType
} from "common/participants/types";
import { CryptoKey } from "common/crypto/types";
import {
  ModificationRequest,
  ModificationResponse,
  isModificationResponse
} from "common/communication/requests/Modification";
import { Certificate, CertificateType } from "common/certs/types";
import {
  verifyParticipants,
  verifyMultiSignature,
  verifyNonceSignature,
  verifyAcceptanceConfirmation
} from "common/certs/verification";
import { isValidARPKICert } from "common/certs/validators";
import { TreeRootDatabase } from "../db";
import { verify, sign } from "common/crypto/rsa";
import {
  parseProof,
  parseProofArray,
  parseMapLeafInclusion,
  parseMapRoot
} from "common/trillian/parse";
import { head, isEqual, isEmpty, tail } from "lodash";
import {
  VerifyRoot,
  VerifyInclusionByHash
} from "common/trillian/verification/logVerifier";
import { VerifyMapLeafInclusion } from "common/trillian/verification/mapVerifier";
import { MapRootV1 } from "common/trillian/types";
import { BuildLogLeaf } from "common/trillian/util";
import {
  getCertDomain,
  getRequestOperation,
  getTreeIdForCert,
  stringify,
  CreateNonce
} from "common/util/funs";
import { isPublisher, isAuditor } from "common/participants/guards";
import { SynchronizationAcknowledge } from "common/communication/requests/Synchronization";
import { Operation } from "common/trillian/entry/entry_pb";
import { RootRequest, RootResponse } from "common/communication/requests/Root";
import { resolveCurrentRoot } from "./Root";

export const processModificationRequest = async <C extends Certificate>(
  ca: CA,
  requester: Participant,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder,
  request: ModificationRequest<C>,
  endpoint: string
) => {
  verifyParticipants(ca, request.cert.caMin, request.cert, request.cert);

  //Don't validate the whole certificate here.
  //Instead, verify the ARPKI properties (which is enough
  //because this CA validated the cert during generation).
  if (!(await isValidARPKICert(request.cert, queryParticipant))) {
    throw new Error("Illegal ARPKI properties!");
  }

  const awaiter = requestHolder.newRequest(
    request,
    (res): res is ModificationResponse<C> => isModificationResponse<C>(res)
  );
  const ils = await queryParticipant(head(request.cert.ilses)!);
  await ils.send(endpoint, request, requester);

  return awaiter;
};

const verifyResponseSignatures = <C extends Certificate>(
  response: ModificationResponse<C> | SynchronizationAcknowledge,
  mainILS: ILS,
  signingCAs: CA[]
) => {
  if (response.nonce != response.request.nonce) {
    throw new Error("Invalid nonce!");
  }

  const { nonceSignature, ...rawResponse } = response;
  if (!verifyNonceSignature(rawResponse, nonceSignature, signingCAs, mainILS)) {
    throw new Error("Invalid nonce signature!");
  }

  const consistencyProof = JSON.parse(response.consistencyProof);
  if (
    !verify(
      consistencyProof,
      response.consistencyProofSignature,
      mainILS.publicKey
    )
  ) {
    throw new Error("Invalid consistency proof signature!");
  }

  const logProof = JSON.parse(response.logProof);
  if (!verify(logProof, response.logProofSignature, mainILS.publicKey)) {
    throw new Error("Invalid log proof signature!");
  }

  const mapProof = JSON.parse(response.mapProof);
  if (!verify(mapProof, response.mapProofSignature, mainILS.publicKey)) {
    throw new Error("Invalid map proof signature!");
  }

  const root = JSON.parse(response.root);
  if (
    !verifyMultiSignature(root, response.rootSignature, signingCAs, mainILS)
  ) {
    throw new Error("Invalid root signature!");
  }
};

const verifyInclusion = async <C extends Certificate>(
  cert: C,
  operation: Operation,
  response: ModificationResponse<C> | SynchronizationAcknowledge,
  ils: ILS
) => {
  const newRoot = parseMapRoot(response.root);

  const logProof = parseProofArray(response.logProof);
  const leaf = BuildLogLeaf(getCertDomain(cert), stringify(cert), operation);
  for (const proof of logProof) {
    await VerifyInclusionByHash(
      newRoot.LogRoot,
      leaf.getMerkleLeafHash_asU8(),
      proof
    );
  }

  const treeId = getTreeIdForCert(ils.trees, cert, TreeType.MAP)!;
  const mapProof = parseMapLeafInclusion(response.mapProof);
  await VerifyMapLeafInclusion(treeId, newRoot, mapProof);
};

const updateTreeRoots = async <C extends Certificate>(
  ilses: ILS[],
  response: ModificationResponse<C>,
  storage: TreeRootDatabase
) => {
  const mainIls = head(ilses)!;
  const syncIlses = tail(ilses)!;

  const type = response.request.cert.type;

  const mainRoot = JSON.parse(response.root);
  await storage.set(mainIls, type, mainRoot);

  for (let idx = 0; idx < syncIlses.length; idx++) {
    const root = JSON.parse(response.acknowledgements[idx].root);
    await storage.set(syncIlses[idx], type, root);
  }
};

export const processModificationResponse = async <C extends Certificate>(
  ca: CA,
  requester: Participant,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder,
  response: ModificationResponse<C>,
  endpoint: string
) => {
  if (!isPublisher(requester) && !isAuditor(requester)) {
    throw new Error("Invalid requester!");
  }

  verifyParticipants(
    ca,
    response.request.cert.caMin,
    response.request.cert,
    response.request.cert
  );

  //Don't validate the whole certificate here.
  //Instead, verify the ARPKI properties (which is enough
  //because this CA validated the cert during generation).
  if (!(await isValidARPKICert(response.request.cert, queryParticipant))) {
    throw new Error("Illegal ARPKI properties!");
  }

  const signingCAs = (await Promise.all(
    response.request.cert.cas
      .slice(response.request.cert.cas.indexOf(ca.url) + 1)
      .map(async ca => await queryParticipant(ca))
  )) as CA[];
  const ilses = (await Promise.all(
    response.request.cert.ilses.map(async ils => await queryParticipant(ils))
  )) as ILS[];

  const mainILS = head(ilses)!;
  verifyResponseSignatures(response, mainILS, signingCAs);

  const remainingILSes = tail(ilses)!;
  for (let idx = 0; idx < response.acknowledgements.length; idx++) {
    verifyResponseSignatures(
      response.acknowledgements[idx],
      remainingILSes[idx],
      signingCAs
    );
  }

  if (
    !verifyAcceptanceConfirmation(
      response.request.cert,
      response.acceptanceConfirmation,
      signingCAs,
      ilses
    )
  ) {
    throw new Error("Invalid acceptance confirmation!");
  }

  const operation = getRequestOperation(response.request);
  const cert = response.request.cert;

  const proofResponses = [response, ...response.acknowledgements];

  for (let idx = 0; idx < ilses.length; idx++) {
    //We have to implicitly trust the first root we get...
    if (await storage.exists(ilses[idx], response.request.cert.type)) {
      await resolveCurrentRoot(
        ca,
        response.root,
        ilses[idx],
        response.request.cert.type,
        queryParticipant,
        storage,
        response.consistencyProof
      );

      await verifyInclusion(cert, operation, proofResponses[idx], ilses[idx]);
    }
  }

  await updateTreeRoots(ilses, response, storage);

  const nextResponse: ModificationResponse<C> = {
    ...response,
    rootSignature: {
      data: response.rootSignature,
      signature: sign(response.rootSignature, privateKey)
    },
    acceptanceConfirmation: {
      data: response.acceptanceConfirmation,
      signature: sign(response.acceptanceConfirmation, privateKey)
    },
    nonceSignature: {
      data: response.nonceSignature,
      signature: sign(response.nonceSignature, privateKey)
    }
  };

  if (signingCAs.length + 1 < response.request.cert.cas.length) {
    const nextCA = await queryParticipant(
      response.request.cert.cas[response.request.cert.cas.indexOf(ca.url) - 1]
    );
    await nextCA.send(endpoint, nextResponse, requester);
  } else {
    requestHolder.notifyResult(response.request, nextResponse);
  }
};
