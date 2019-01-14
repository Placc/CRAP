import { fromValue } from "long";
import Hasher from "./logHasher";

export const chainInner = (
  seed: Uint8Array,
  proof: Uint8Array[],
  index: string
): Uint8Array => {
  const longIndex = fromValue(index);
  var result = seed;
  for (var i = 0; i < proof.length; i++) {
    if (
      longIndex
        .shiftRightUnsigned(i)
        .and(1)
        .eq(0)
    ) {
      result = Hasher.hashChildren(result, proof[i]);
    } else {
      result = Hasher.hashChildren(proof[i], result);
    }
  }
  return result;
};

export const chainInnerRight = (
  seed: Uint8Array,
  proof: Uint8Array[],
  index: string
) => {
  const longIndex = fromValue(index);
  var result = seed;
  for (var i = 0; i < proof.length; i++) {
    if (
      longIndex
        .shiftRightUnsigned(i)
        .and(1)
        .eq(1)
    ) {
      result = Hasher.hashChildren(proof[i], result);
    }
  }

  return result;
};
export const chainBorderRight = (
  seed: Uint8Array,
  proof: Uint8Array[]
): Uint8Array => {
  var result = seed;
  for (const p of proof) {
    result = Hasher.hashChildren(p, result);
  }
  return result;
};
