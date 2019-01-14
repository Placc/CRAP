export type LogRootV1 = {
  TreeSize: string;
  RootHash: Uint8Array;
  TimestampNanos: string;
  Revision: string;
  Metadata: Uint8Array;
  Signature: Uint8Array;
};

export type MapRootV1 = {
  RootHash: Uint8Array;
  TimestampNanos: string;
  Revision: string;
  LogRoot: LogRootV1;
  Signature: Uint8Array;
};

export type Proof = {
  leafIndex: string;
  hashesList: Array<Uint8Array>;
};

export type MapLeaf = {
  index: Uint8Array;
  leafHash: Uint8Array;
  leafValue: Uint8Array;
  extraData: Uint8Array;
};

export type MapLeafInclusion = {
  leaf?: MapLeaf;
  inclusionList: Array<Uint8Array>;
};

export type LogLeaf = {
  merkleLeafHash: Uint8Array;
  leafValue: Uint8Array;
  extraData: Uint8Array;
  leafIndex: string;
  leafIdentityHash: Uint8Array;
  queueTimestamp?: any;
  integrateTimestamp?: any;
};
