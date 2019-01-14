import logger from "loglevel";
import { createHash } from "crypto";
import { MapHasher } from "./types";

type TestMapHasherBase = {
  nullHashes: Uint8Array[];
  size: () => number;
};

const LeafHashPrefix = 0;
const NodeHashPrefix = 1;

const Strategy = "sha256";

const New = () => createHash(Strategy);

const NewTestMapHasher = (): MapHasher => {
  const base = {
    nullHashes: new Array<Uint8Array>(),
    size: () => 32
  };

  initNullHashes(base);

  return {
    hashEmpty: HashEmpty(base),
    hashLeaf: HashLeaf,
    hashChildren: HashChildren,
    bitLen: BitLen(base),
    size: base.size
  };
};

const HashEmpty = (base: TestMapHasherBase) => (
  treeId: string,
  index: Uint8Array,
  height: number
): Uint8Array => {
  if (height < 0 || height >= base.nullHashes.length) {
    throw new Error(`HashEmpty(${height}) out of bounds`);
  }
  const depth = BitLen(base)() - height;

  logger.info(`HashEmpty(${index}, ${depth}): ${base.nullHashes[height]}`);
  return base.nullHashes[height];
};

// HashLeaf returns the Merkle tree leaf hash of the data passed in through leaf.
// The hashed structure is leafHashPrefix||leaf.
const HashLeaf = (
  treeId: string,
  index: Uint8Array,
  leaf: Uint8Array
): Uint8Array => {
  const h = New();
  h.update(new Uint8Array([LeafHashPrefix]));
  h.update(leaf);
  const r = h.digest();
  logger.info(`HashLeaf(${index}): ${r}`);
  return r;
};

// HashChildren returns the internal Merkle tree node hash of the the two child nodes l and r.
// The hashed structure is NodeHashPrefix||l||r.
const HashChildren = (l: Uint8Array, r: Uint8Array): Uint8Array => {
  const h = New();
  h.update(new Uint8Array([NodeHashPrefix]));
  h.update(l);
  h.update(r);
  const p = h.digest();
  logger.info(`HashChildren(${l}, ${r}): ${p}`);
  return p;
};

// BitLen returns the number of bits in the hash function.
const BitLen = (base: TestMapHasherBase) => (): number => {
  return base.size() * 8;
};

// initNullHashes sets the cache of empty hashes, one for each level in the sparse tree,
// starting with the hash of an empty leaf, all the way up to the root hash of an empty tree.
// These empty branches are not stored on disk in a sparse tree. They are computed since their
// values are well-known.
const initNullHashes = (base: TestMapHasherBase) => {
  // Leaves are stored at depth 0. Root is at Size()*8.
  // There are Size()*8 edges, and Size()*8 + 1 nodes in the tree.
  const nodes = base.size() * 8 + 1;
  const r = new Array<Uint8Array>(nodes);
  r[0] = HashLeaf("0", new Uint8Array(0), new Uint8Array(0));
  for (let i = 1; i < nodes; i++) {
    r[i] = HashChildren(r[i - 1], r[i - 1]);
  }
  base.nullHashes = r;
};

const TestMapHasher = NewTestMapHasher();

export default TestMapHasher;
