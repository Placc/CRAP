import { MapLeafInclusion, MapRootV1 } from "../types";
import { MaskLeft, Copy, Bit, NewNodeIDFromHash, Siblings } from "./nodeID";
import { bufferEqual } from "../util";
import { MapHasher } from "../hash/types";
import ConiksHasher from "../hash/coniks";

export const VerifyMapLeafInclusion = async (
  treeId: string,
  root: MapRootV1,
  leafProof: MapLeafInclusion
) => {
  VerifyMapLeafInclusionHash(treeId, root.RootHash, leafProof);
};

export const VerifyMapLeafInclusionHash = (
  treeId: string,
  rootHash: Uint8Array,
  leafProof: MapLeafInclusion
) => {
  const index = leafProof.leaf!.index;
  const leaf = leafProof.leaf!.leafValue;
  const proof = leafProof.inclusionList;

  const MapHasher = ConiksHasher;
  VerifyMapInclusionProof(treeId, index, leaf, rootHash, proof, MapHasher);
};

export const VerifyMapInclusionProof = (
  treeId: string,
  index: Uint8Array,
  leaf: Uint8Array,
  expectedRoot: Uint8Array,
  proof: Uint8Array[],
  hasher: MapHasher
) => {
  if (index.length * 8 != hasher.bitLen())
    throw new Error(`index len: ${index.length * 8}, want ${hasher.bitLen()}`);
  if (proof.length != hasher.bitLen())
    throw new Error(`index len: ${proof.length}, want ${hasher.bitLen()}`);

  for (let i = 0; i < proof.length; i++) {
    if (proof[i].length != 0 && proof[i].length != hasher.size())
      throw new Error(
        `proof[${i}] len: ${proof[i].length}, want 0 or ${hasher.size()}`
      );
  }

  let runningHash: Uint8Array = new Uint8Array(0);
  if (leaf.length != 0) {
    runningHash = hasher.hashLeaf(treeId, index, leaf);
  }

  const nID = NewNodeIDFromHash(index);
  const siblings = Siblings(nID);
  for (let height = 0; height < siblings.length; height++) {
    let pElement = proof[height];

    // Since empty values are tied to a location and a level,
    // HashEmpty(leve1) != HashChildren(E0, E0).
    // Therefore we need to maintain an empty marker along the
    // proof path until the first non-empty element so we can call
    // HashEmpty once at the top of the empty branch.
    if (runningHash.length == 0 && pElement.length == 0) {
      continue;
    }
    // When we reach a level that has a neighbor, we compute the empty value
    // for the branch that we are on before combining it with the neighbor.
    if (runningHash.length == 0 && pElement.length != 0) {
      const depth = nID.PrefixLenBits - height;
      const emptyBranch = MaskLeft(Copy(nID), depth);
      runningHash = hasher.hashEmpty(treeId, emptyBranch.Path, height);
    }

    if (runningHash.length != 0 && pElement.length == 0) {
      pElement = hasher.hashEmpty(treeId, siblings[height].Path, height);
    }

    const proofIsRightHandElement = Bit(nID, height) == 0;
    if (proofIsRightHandElement) {
      runningHash = hasher.hashChildren(runningHash, pElement);
    } else {
      runningHash = hasher.hashChildren(pElement, runningHash);
    }
  }

  if (runningHash.length == 0) {
    const depth = 0;
    const emptyBranch = MaskLeft(Copy(nID), depth);
    runningHash = hasher.hashEmpty(treeId, emptyBranch.Path, hasher.bitLen());
  }

  if (!bufferEqual(runningHash, expectedRoot)) {
    throw new Error(
      `calculated root: ${Buffer.from(runningHash).toString(
        "hex"
      )}, want ${Buffer.from(expectedRoot).toString("hex")}`
    );
  }
};
