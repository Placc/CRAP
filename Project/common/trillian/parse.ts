import {
  MapRootV1,
  LogRootV1,
  Proof,
  MapLeaf,
  MapLeafInclusion,
  LogLeaf
} from "./types";
import { stringify } from "../util/funs";

export const parseLogRoot = (json: string): LogRootV1 => {
  const rawRoot = JSON.parse(json);

  return {
    Metadata: Buffer.from(rawRoot.Metadata, "base64"),
    Revision: rawRoot.Revision,
    RootHash: Buffer.from(rawRoot.RootHash, "base64"),
    Signature: Buffer.from(rawRoot.Signature, "base64"),
    TimestampNanos: rawRoot.TimestampNanos,
    TreeSize: rawRoot.TreeSize
  };
};

export const parseMapRoot = (json: string): MapRootV1 => {
  const rawRoot = JSON.parse(json);

  return {
    LogRoot: parseLogRoot(stringify(rawRoot.LogRoot)),
    Revision: rawRoot.Revision,
    RootHash: Buffer.from(rawRoot.RootHash, "base64"),
    Signature: Buffer.from(rawRoot.Signature, "base64"),
    TimestampNanos: rawRoot.TimestampNanos
  };
};

export const parseProofArray = (json: string): Proof[] => {
  const array = JSON.parse(json);

  return array.map(proof => parseProof(stringify(proof)));
};

export const parseProof = (json: string): Proof => {
  const rawProof = JSON.parse(json);

  return {
    hashesList: rawProof.hashesList.map(hash => Buffer.from(hash, "base64")),
    leafIndex: rawProof.leafIndex
  };
};

export const parseLogLeaf = (json: string): LogLeaf => {
  const rawLeaf = JSON.parse(json);

  return {
    extraData: Buffer.from(rawLeaf.extraData, "base64"),
    leafIndex: rawLeaf.leafIndex,
    merkleLeafHash: Buffer.from(rawLeaf.merkleLeafHash, "base64"),
    leafValue: Buffer.from(rawLeaf.leafValue, "base64"),
    leafIdentityHash: Buffer.from(rawLeaf.leafIdentityHash, "base64"),
    queueTimestamp: rawLeaf.queueTimestamp,
    integrateTimestamp: rawLeaf.integrateTimestamp
  };
};

export const parseMapLeaf = (json: string): MapLeaf => {
  const rawLeaf = JSON.parse(json);

  return {
    extraData: Buffer.from(rawLeaf.extraData, "base64"),
    index: Buffer.from(rawLeaf.index, "base64"),
    leafHash: Buffer.from(rawLeaf.leafHash, "base64"),
    leafValue: Buffer.from(rawLeaf.leafValue, "base64")
  };
};

export const parseMapLeafInclusion = (json: string): MapLeafInclusion => {
  const rawInclusion = JSON.parse(json);

  return {
    inclusionList: rawInclusion.inclusionList.map(incl =>
      Buffer.from(incl, "base64")
    ),
    leaf: rawInclusion.leaf
      ? parseMapLeaf(stringify(rawInclusion.leaf))
      : undefined
  };
};
