export type MapHasher = {
  hashEmpty(treeId: string, index: Uint8Array, height: number): Uint8Array;
  hashLeaf(treeId: string, index: Uint8Array, leaf: Uint8Array): Uint8Array;
  hashChildren(left: Uint8Array, right: Uint8Array): Uint8Array;
  bitLen(): number;
  size(): number;
};

export type LogHasher = {
  emptyRoot: () => Uint8Array;
  hashLeaf: (leafValue: Uint8Array) => Uint8Array;
  hashChildren: (left: Uint8Array, right: Uint8Array) => Uint8Array;
  size: () => number;
};
