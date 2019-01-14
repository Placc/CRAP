import logger from "loglevel";
import Hash from "js-sha512";
import { fromValue } from "long";
import { MapHasher } from "./types";

type ConiksHasherBase = {
  size: () => number;
  bitLen(): number;
};

const emptyIdentifier = "E";
const leafIdentifier = "L";

const New = () => Hash.sha512_256.create();

const NewConiksHasher = (): MapHasher => {
  const base = {
    bitLen: BitLen(32),
    size: () => 32
  };

  return {
    hashEmpty: HashEmpty(base),
    hashLeaf: HashLeaf(base),
    hashChildren: HashChildren,
    ...base
  };
};

// HashEmpty returns the hash of an empty branch at a given height.
// A height of 0 indicates the hash of an empty leaf.
// Empty branches within the tree are plain interior nodes e1 = H(e0, e0) etc.
const HashEmpty = (base: ConiksHasherBase) => (
  treeId: string,
  index: Uint8Array,
  height: number
): Uint8Array => {
  const depth = base.bitLen() - height;
  const hash = New();
  hash.update(emptyIdentifier);
  WriteBE(hash, treeId, NumberType.INT64);
  hash.update(MaskIndex(base)(index, depth));
  WriteBE(hash, depth, NumberType.INT32);
  const result = hash.digest();
  logger.info(`HashEmpty (${index}, ${depth}): ${result}`);
  return Uint8Array.from(result);
};

// HashChildren returns the internal Merkle tree node hash of the the two child nodes l and r.
// The hashed structure is  H(l || r).
const HashLeaf = (base: ConiksHasherBase) => (
  treeId: string,
  index: Uint8Array,
  leaf: Uint8Array
): Uint8Array => {
  const depth = base.bitLen();
  const h = New();
  h.update(leafIdentifier);
  WriteBE(h, treeId, NumberType.INT64);
  h.update(MaskIndex(base)(index, depth));
  WriteBE(h, depth, NumberType.INT32);
  h.update(leaf);
  const r = h.digest();
  logger.info(`HashLeaf(${index}, ${depth}, ${leaf},): ${r}`);
  return Uint8Array.from(r);
};

// HashChildren returns the internal Merkle tree node hash of the the two child nodes l and r.
// The hashed structure is  H(l || r).
const HashChildren = (l: Uint8Array, r: Uint8Array): Uint8Array => {
  const h = New();
  h.update(l);
  h.update(r);
  const p = h.digest();
  logger.info(`HashChildren(${l}, ${r}): ${p}`);
  return Uint8Array.from(p);
};

// BitLen returns the number of bits in the hash function.
const BitLen = (size: number) => (): number => {
  return size * 8;
};

// leftmask contains bitmasks indexed such that the left x bits are set. It is
// indexed by byte position from 0-7 0 is special cased to 0xFF since 8 mod 8
// is 0. leftmask is only used to mask the last byte.
var leftmask = [0xff, 0x80, 0xc0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe];

// maskIndex returns index with only the left depth bits set.
// index must be of size m.Size() and 0 <= depth <= m.BitLen().
// e.g.
export const MaskIndex = (base: ConiksHasherBase) => (
  index: Uint8Array,
  depth: number
): Uint8Array => {
  if (index.length != base.size()) {
    throw new Error(`index len: ${index.length}, want ${base.size()}`);
  }
  if (depth < 0 || depth > base.bitLen()) {
    throw new Error(`depth: ${depth}, want <= ${base.bitLen()} && > 0`);
  }

  // Create an empty index Size() bytes long.
  let ret = new Uint8Array(base.size()).fill(0);
  if (depth > 0) {
    // Copy the first depthBytes.
    const depthBytes = (depth + 7) >> 3;
    ret.set(index.slice(0, depthBytes));
    // Mask off unwanted bits in the last byte.
    ret[depthBytes - 1] = ret[depthBytes - 1] & leftmask[depth % 8];
  }
  return ret;
};

enum NumberType {
  INT32,
  INT64
}

const WriteBE = (
  writer: { update(v: Array<number>) },
  val: string | number | Long,
  typ: NumberType
) => {
  if (typ == NumberType.INT32) {
    const byte = new Array(4).fill(0);
    byte[0] = fromValue(val)
      .shiftRightUnsigned(24)
      .mod(256)
      .toNumber();
    byte[1] = fromValue(val)
      .shiftRightUnsigned(16)
      .mod(256)
      .toNumber();
    byte[2] = fromValue(val)
      .shiftRightUnsigned(8)
      .mod(256)
      .toNumber();
    byte[3] = fromValue(val)
      .mod(256)
      .toNumber();
    writer.update(byte);
  } else {
    const byte = new Array(8).fill(0);
    byte[0] = fromValue(val)
      .shiftRightUnsigned(56)
      .mod(256)
      .toNumber();
    byte[1] = fromValue(val)
      .shiftRightUnsigned(48)
      .mod(256)
      .toNumber();
    byte[2] = fromValue(val)
      .shiftRightUnsigned(40)
      .mod(256)
      .toNumber();
    byte[3] = fromValue(val)
      .shiftRightUnsigned(32)
      .mod(256)
      .toNumber();
    byte[4] = fromValue(val)
      .shiftRightUnsigned(24)
      .mod(256)
      .toNumber();
    byte[5] = fromValue(val)
      .shiftRightUnsigned(16)
      .mod(256)
      .toNumber();
    byte[6] = fromValue(val)
      .shiftRightUnsigned(8)
      .mod(256)
      .toNumber();
    byte[7] = fromValue(val)
      .mod(256)
      .toNumber();
    writer.update(byte);
  }
};

const ConiksHasher = NewConiksHasher();

export default ConiksHasher;
