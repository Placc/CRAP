import { fromValue } from "long";
import Hasher from "../hash/logHasher";
import Long from "long";
import { isNil } from "lodash";
import { Proof } from "../types";
import {
  chainInner,
  chainBorderRight,
  chainInnerRight
} from "../hash/hashChainer";
import { LogRootV1 } from "../types";
import { len64, onesCount64, bufferEqual, trailingZeros64 } from "../util";

const innerProofSize = (index: Long, size: Long) => {
  return len64(index.xor(size.sub(1)));
};

const decompInclProof = (index: string, size: string) => {
  const longIndex = fromValue(index);
  const longSize = fromValue(size);
  const inner = innerProofSize(longIndex, longSize);
  const border = onesCount64(longIndex.shiftRightUnsigned(inner));
  return { inner, border };
};

const RootFromInclusionProof = (
  leafIndex: string,
  treeSize: string,
  proof: Array<Uint8Array>,
  leafHash: Uint8Array
): Uint8Array => {
  if (fromValue(leafIndex).lt(0)) throw new Error(`leafIndex ${leafIndex} < 0`);
  if (fromValue(treeSize).lt(0)) throw new Error(`treeSize ${treeSize} < 0`);
  if (fromValue(leafIndex).gte(treeSize))
    throw new Error(
      `leafIndex is beyond treeSize: ${leafIndex} >= ${treeSize}`
    );
  if (leafHash.length < Hasher.size())
    throw new Error(
      `leafHash has unexpected size ${leafHash.length}, want ${Hasher.size()}`
    );

  const { inner, border } = decompInclProof(leafIndex, treeSize);
  if (proof.length != inner + border)
    throw new Error(`wrong proof size ${proof.length}, want ${inner + border}`);

  const innerHash = chainInner(leafHash, proof.slice(0, inner), leafIndex);
  const borderHash = chainBorderRight(innerHash, proof.slice(inner));

  return borderHash;
};

const VerifyInclusionProof = (
  leafIndex: string,
  treeSize: string,
  proof: Uint8Array[],
  root: Uint8Array,
  leafHash: Uint8Array
) => {
  const calcRoot = RootFromInclusionProof(leafIndex, treeSize, proof, leafHash);

  if (!bufferEqual(calcRoot, root)) {
    throw new Error(
      `Root mismatch: Expected ${Buffer.from(root).toString(
        "hex"
      )}, got ${Buffer.from(calcRoot).toString("hex")}`
    );
  }
};

export const VerifyInclusionByHash = (
  trusted: LogRootV1,
  leafHash: Uint8Array,
  proof: Proof
) => {
  if (isNil(trusted))
    throw new Error("VerifyInclusionByHash() error: trusted == nil");
  if (isNil(proof))
    throw new Error("VerifyInclusionByHash() error: proof == nil");

  VerifyInclusionProof(
    proof.leafIndex,
    trusted.TreeSize,
    proof.hashesList,
    trusted.RootHash,
    leafHash
  );
};

export const VerifyRoot = async (
  trusted: LogRootV1,
  newRoot: LogRootV1,
  consistency: Uint8Array[]
): Promise<LogRootV1> => {
  if (isNil(trusted)) {
    throw new Error("VerifyRoot() error: trusted == nil");
  }
  if (isNil(newRoot)) {
    throw new Error("VerifyRoot() error: newRoot == nil");
  }

  // Implicitly trust the first root we get.
  if (fromValue(trusted.TreeSize).notEquals(0)) {
    // Verify consistency proof.
    VerifyConsistencyProof(
      trusted.TreeSize,
      newRoot.TreeSize,
      trusted.RootHash,
      newRoot.RootHash,
      consistency
    );
  }

  return newRoot;
};

export const VerifyConsistencyProof = (
  snapshot1: string,
  snapshot2: string,
  root1: Uint8Array,
  root2: Uint8Array,
  proof: Uint8Array[]
) => {
  if (fromValue(snapshot1).lt(0))
    throw new Error(`snapshot1 (${snapshot1}) < 0 `);
  if (fromValue(snapshot2).lt(snapshot1))
    throw new Error(`snapshot2 (${snapshot2}) < snapshot1 (${snapshot1})`);
  if (snapshot1 == snapshot2) {
    if (!bufferEqual(root1, root2))
      throw new Error(
        `Root mismatch: Expected ${Buffer.from(root2).toString(
          "hex"
        )}, got ${Buffer.from(root1).toString("hex")}`
      );
    else if (proof.length > 0)
      throw new Error("root1 and root2 match, but proof is non-empty");
    return;
  }
  if (fromValue(snapshot1).equals(0)) {
    if (proof.length > 0)
      throw new Error(
        `expected empty proof, but got ${proof.length} components`
      );
    return;
  }
  if (proof.length == 0) throw new Error("empty proof");

  let { inner, border } = decompInclProof(
    fromValue(snapshot1)
      .sub(1)
      .toString(),
    snapshot2
  );
  const shift = trailingZeros64(fromValue(snapshot1));
  inner -= shift; // Note: shift < inner if snapshot1 < snapshot2.

  // The proof includes the root hash for the sub-tree of size 2^shift.
  let seed = proof[0];
  let start = 1;

  if (fromValue(snapshot1).equals(Long.ONE.shiftLeft(shift))) {
    // Unless snapshot1 is that very 2^shift.
    seed = root1;
    start = 0;
  }
  const expProofSize = fromValue(start)
    .add(inner)
    .add(border);
  if (!expProofSize.equals(proof.length))
    throw new Error(`wrong proof size ${proof.length}, want ${expProofSize}`);

  const theProof = proof.slice(start);
  // Now len(proof) == inner+border, and proof is effectively a suffix of
  // inclusion proof for entry |snapshot1-1| in a tree of size |snapshot2|.

  // Verify the first root.
  const mask = fromValue(snapshot1)
    .sub(1)
    .shiftRightUnsigned(shift)
    .toString(); // Start chaining from level |shift|.
  let hash1 = chainInnerRight(seed, theProof.slice(0, inner), mask);
  hash1 = chainBorderRight(hash1, theProof.slice(inner));
  if (!bufferEqual(hash1, root1))
    throw new Error(
      `Root mismatch: Expected ${Buffer.from(root1).toString(
        "hex"
      )}, got ${Buffer.from(hash1).toString("hex")}`
    );

  // Verify the second root.
  let hash2 = chainInner(seed, theProof.slice(0, inner), mask);
  hash2 = chainBorderRight(hash2, theProof.slice(inner));
  if (!bufferEqual(hash2, root2))
    throw new Error(
      `Root mismatch: Expected ${Buffer.from(root2).toString(
        "hex"
      )}, got ${Buffer.from(hash2).toString("hex")}`
    );
};

// VerifiedPrefixHashFromInclusionProof calculates a root hash over leaves
// [0..subSize), based on the inclusion |proof| and |leafHash| for a leaf at
// index |subSize-1| in a tree of the specified |size| with the passed in
// |root| hash.
// Returns an error if the |proof| verification fails. The resulting smaller
// tree's root hash is trusted iff the bigger tree's |root| hash is trusted.
export const VerifiedPrefixHashFromInclusionProof = async (
  subSize: string,
  size: string,
  proof: Uint8Array[],
  root: Uint8Array,
  leafHash: Uint8Array
): Promise<Uint8Array> => {
  if (fromValue(subSize).lte(0)) {
    throw new Error(`subtree size is ${subSize}, want > 0`);
  }
  const leaf = fromValue(subSize).sub(1);

  await VerifyInclusionProof(leaf.toString(), size, proof, root, leafHash);

  const inner = innerProofSize(leaf, fromValue(size));
  let res = chainInnerRight(leafHash, proof.slice(0, inner), leaf.toString());
  res = chainBorderRight(res, proof.slice(inner));

  return res;
};
