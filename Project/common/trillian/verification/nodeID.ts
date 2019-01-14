type NodeID = {
  Path: Uint8Array;
  PrefixLenBits: number;
};

export const NewNodeIDFromHash = (h: Uint8Array): NodeID => {
  return {
    Path: h,
    PrefixLenBits: h.length * 8
  };
};

export const Copy = (n: NodeID): NodeID => {
  return {
    Path: new Uint8Array([...n.Path]),
    PrefixLenBits: n.PrefixLenBits
  };
};

var leftmask = [0xff, 0x80, 0xc0, 0xe0, 0xf0, 0xf8, 0xfc, 0xfe];

export const bytesForBits = (numBits: number): number => {
  return (numBits + 7) >> 3;
};

export const MaskLeft = (n: NodeID, depth: number): NodeID => {
  let r = new Uint8Array(n.Path.length).fill(0);

  if (depth > 0) {
    const depthBytes = bytesForBits(depth);
    r.set(n.Path.slice(0, depthBytes));
    r[depthBytes - 1] = r[depthBytes - 1] & leftmask[depth % 8];
  }
  if (depth < n.PrefixLenBits) {
    n.PrefixLenBits = depth;
  }
  n.Path = r;
  return n;
};

export const PathLenBits = (n: NodeID): number => {
  return n.Path.length * 8;
};

export const SetBit = (n: NodeID, i: number, b: number) => {
  const bIndex = Math.floor((PathLenBits(n) - i - 1) / 8);
  if (b == 0) {
    n.Path[bIndex] &= ~(1 << i % 8);
  } else {
    n.Path[bIndex] |= 1 << i % 8;
  }
};

export const Bit = (n: NodeID, i: number): number => {
  if (i > PathLenBits(n) - 1) {
    throw new Error(`Bit(${i}) > (PathLenBits(n) - 1): ${PathLenBits(n) - 1}`);
  }
  const bIndex = Math.floor((PathLenBits(n) - i - 1) / 8);
  return (n.Path[bIndex] >> i % 8) & 0x01;
};

export const FlipRightBit = (n: NodeID, i: number): NodeID => {
  SetBit(n, i, Bit(n, i) ^ 1);
  return n;
};

export const Neighbor = (n: NodeID): NodeID => {
  const height = PathLenBits(n) - n.PrefixLenBits;
  FlipRightBit(n, height);
  return n;
};

export const Siblings = (n: NodeID): NodeID[] => {
  const sibs = new Array<NodeID>(n.PrefixLenBits);
  for (let i = 0; i < sibs.length; i++) {
    const depth = n.PrefixLenBits - i;
    sibs[i] = Neighbor(MaskLeft(Copy(n), depth));
  }
  return sibs;
};
