import { ILS, CA, TreeType, Participant } from "common/participants/types";
import {
  AuditRequest,
  AuditResponse
} from "common/communication/requests/Audit";
import { Server } from "common/communication/types";
import { CreateNonce, stringify, getTreeIdForCertType } from "common/util/funs";
import { TreeRootDatabase } from "./db";
import { CertificateType } from "common/certs/types";
import { sign, verify } from "common/crypto/rsa";
import { includes, head, isEqual, isNil, zip } from "lodash";
import {
  verifyMultiSignature,
  verifyNonceSignature
} from "common/certs/verification";
import {
  VerifiedPrefixHashFromInclusionProof,
  VerifyInclusionByHash,
  VerifyRoot
} from "common/trillian/verification/logVerifier";
import { VerifyMapLeafInclusion } from "common/trillian/verification/mapVerifier";
import {
  parseMapRoot,
  parseProofArray,
  parseProof,
  parseMapLeafInclusion,
  parseLogLeaf
} from "common/trillian/parse";
import {
  MapLeaf,
  MapLeafInclusion,
  MapRootV1,
  Proof,
  LogLeaf
} from "common/trillian/types";
import { fromValue } from "long";
import { MonitorConfiguration } from "./config/types";
import { BuildJSONMapLeafFromJSONLogLeaf } from "common/trillian/util";

const verifySignatures = (response: AuditResponse, ils: ILS, cas: CA[]) => {
  const { nonceSignature, ...rawResponse } = response;
  if (!verifyNonceSignature(rawResponse, nonceSignature, cas, ils)) {
    throw new Error(`Couldn't verify nonce signature!`);
  }

  if (
    !verify(
      JSON.parse(response.consistencyProof),
      response.consistencyProofSignature,
      ils.publicKey
    )
  ) {
    throw new Error(`Couldn't verify consistency proof signature!`);
  }

  if (
    !verify(
      JSON.parse(response.leaves),
      response.leavesSignature,
      ils.publicKey
    )
  ) {
    throw new Error(`Couldn't verify leaves signature!`);
  }

  if (
    !verify(
      JSON.parse(response.logProofs),
      response.logProofsSignature,
      ils.publicKey
    )
  ) {
    throw new Error(`Couldn't verify log proofs signature!`);
  }

  if (
    !verify(
      JSON.parse(response.mapProofs),
      response.mapProofsSignature,
      ils.publicKey
    )
  ) {
    throw new Error(`Couldn't verify map proofs signature!`);
  }

  if (
    !verifyMultiSignature(
      JSON.parse(response.root),
      response.rootSignature,
      cas,
      ils
    )
  ) {
    throw new Error(`Couldn't verify root signature!`);
  }
};

const verifyConsistency = async (
  lastRoot: MapRootV1 | undefined,
  newRoot: MapRootV1,
  consistencyProof: Proof
) => {
  if (lastRoot) {
    await VerifyRoot(
      lastRoot.LogRoot,
      newRoot.LogRoot,
      consistencyProof.hashesList
    );
  }
};

const verifyLogRoot = async (
  lastRoot: MapRootV1 | undefined,
  newRoot: MapRootV1,
  leaves: LogLeaf[],
  proofs: Proof[][]
) => {
  const zipped = zip(leaves, proofs);

  let intermediateRoot = {
    size: lastRoot ? lastRoot.LogRoot.TreeSize : "0",
    hash: lastRoot ? lastRoot.LogRoot.RootHash : undefined
  };

  for (const [leaf, logProof] of zipped) {
    if (!leaf || !logProof) {
      throw new Error("Number of leaves and proofs differs!");
    }

    for (const proof of logProof) {
      if (!isEqual(intermediateRoot.hash, head(proof.hashesList))) {
        throw new Error("Invalid beginning of log proof!");
      }

      if (fromValue(intermediateRoot.size).gt(0)) {
        const newSize = fromValue(intermediateRoot.size).add(1);
        if (newSize.gt(newRoot.LogRoot.TreeSize)) {
          break;
        }

        const newHash = await VerifiedPrefixHashFromInclusionProof(
          newSize.toString(),
          newRoot.LogRoot.TreeSize,
          proof.hashesList,
          newRoot.LogRoot.RootHash,
          leaf.merkleLeafHash
        );

        intermediateRoot = {
          size: newSize.toString(),
          hash: newHash
        };
      } else {
        await VerifyInclusionByHash(
          newRoot.LogRoot,
          leaf.merkleLeafHash,
          proof
        );
      }
    }
  }

  if (
    intermediateRoot.hash &&
    !isEqual(intermediateRoot.hash, newRoot.LogRoot.RootHash)
  ) {
    throw new Error("Intermediate root hash doesn't match new log root hash!");
  }
};

export const verifyMapSnapshot = async (
  treeId: string,
  leaves: LogLeaf[],
  newRoot: MapRootV1,
  proofs: MapLeafInclusion[]
) => {
  const localLeaves = new Map<string, Uint8Array>();
  const proofLeaves = new Map<string, Uint8Array>();

  for (const leaf of leaves) {
    const mapLeaf = BuildJSONMapLeafFromJSONLogLeaf(leaf);
    const tempIndex = Buffer.from(mapLeaf.index).toString("base64");
    localLeaves.set(tempIndex, mapLeaf.leafValue);
  }
  for (const proof of proofs) {
    await VerifyMapLeafInclusion(treeId, newRoot, proof);

    if (proof.leaf) {
      const tempIndex = Buffer.from(proof.leaf.index).toString("base64");
      proofLeaves.set(tempIndex, proof.leaf.leafValue);
    }
  }

  if (!isEqual(localLeaves, proofLeaves)) {
    throw new Error(
      `Map proof snapshot and leaves obtained from history differ!`
    );
  }
};

const verifyAuditResponse = async (
  response: AuditResponse,
  ils: ILS,
  cas: CA[],
  lastRoot?: MapRootV1
) => {
  verifySignatures(response, ils, cas);

  const newRoot = parseMapRoot(response.root);
  const consistencyProof = parseProof(response.consistencyProof);

  await verifyConsistency(lastRoot, newRoot, consistencyProof);

  const leaves = JSON.parse(response.leaves).map(leaf =>
    parseLogLeaf(stringify(leaf!))
  ) as LogLeaf[];
  const proofs = JSON.parse(response.logProofs).map(proof =>
    parseProofArray(stringify(proof!))
  ) as Proof[][];

  await verifyLogRoot(lastRoot, newRoot, leaves, proofs);

  const treeId = getTreeIdForCertType(
    ils.trees,
    response.request.certType,
    TreeType.MAP
  )!;
  const mapProofs = JSON.parse(response.mapProofs).map(proof =>
    parseMapLeafInclusion(stringify(proof))
  ) as MapLeafInclusion[];

  await verifyMapSnapshot(treeId, leaves, newRoot, mapProofs);

  return newRoot;
};

const certTypes: CertificateType[] = [
  "PublisherCertificate",
  "ApplicationCertificate",
  "AuditionCertificate"
];

const runMonitor = async (
  ils: ILS,
  cas: CA[],
  lastRoots: Map<CertificateType, MapRootV1 | undefined>
): Promise<[AuditResponse[], Map<CertificateType, MapRootV1>]> => {
  const headCA = head(cas)!;

  const responses = new Array<AuditResponse>();
  const newRoots = new Map<CertificateType, MapRootV1>();
  const certificateTypes = [...lastRoots.keys()];

  for (const certType of certificateTypes) {
    const lastRoot = lastRoots.get(certType);

    const auditRequest: AuditRequest = {
      type: "AuditRequest",
      certType,
      cas: cas.map(ca => ca.url),
      ils: ils.url,
      nonce: CreateNonce(),
      sinceRevision: lastRoot ? lastRoot.Revision : "0"
    };

    const response = (await headCA.send(
      "audit",
      auditRequest
    )) as AuditResponse;

    if (response.nonce != auditRequest.nonce) {
      throw new Error(
        `Invalid nonce in response for ils ${ils.url} and type ${certType}!`
      );
    }

    responses.push(response);

    const newRoot = await verifyAuditResponse(response, ils, cas, lastRoot);

    newRoots.set(certType, newRoot);
  }

  return [responses, newRoots];
};

export const updateIlsRoots = async (
  ilsUrl: string,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  knownCAs: string[],
  certificateTypes?: CertificateType[],
  revision?: string
) => {
  const ils = (await queryParticipant(ilsUrl)) as ILS;
  const cas = (await Promise.all(
    knownCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const roots = new Map<CertificateType, MapRootV1 | undefined>();

  for (const typ of certificateTypes || certTypes) {
    const root = await storage.get(ils, typ, revision);
    roots.set(typ, root);
  }

  const [responses, newRoots] = await runMonitor(ils, cas, roots);

  for (const [typ, root] of newRoots.entries()) {
    await storage.set(ils, typ, root);
  }

  return responses;
};
