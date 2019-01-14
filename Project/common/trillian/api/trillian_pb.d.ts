// package: trillian
// file: trillian.proto

import * as jspb from "google-protobuf";
import * as crypto_keyspb_keyspb_pb from "../crypto/keyspb/keyspb_pb";
import * as crypto_sigpb_sigpb_pb from "../crypto/sigpb/sigpb_pb";
import * as google_protobuf_any_pb from "google-protobuf/google/protobuf/any_pb";
import * as google_protobuf_duration_pb from "google-protobuf/google/protobuf/duration_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

export class Tree extends jspb.Message {
  getTreeId(): string;
  setTreeId(value: string): void;

  getTreeState(): TreeState;
  setTreeState(value: TreeState): void;

  getTreeType(): TreeType;
  setTreeType(value: TreeType): void;

  getHashStrategy(): HashStrategy;
  setHashStrategy(value: HashStrategy): void;

  getHashAlgorithm(): crypto_sigpb_sigpb_pb.DigitallySigned.HashAlgorithm;
  setHashAlgorithm(
    value: crypto_sigpb_sigpb_pb.DigitallySigned.HashAlgorithm
  ): void;

  getSignatureAlgorithm(): crypto_sigpb_sigpb_pb.DigitallySigned.SignatureAlgorithm;
  setSignatureAlgorithm(
    value: crypto_sigpb_sigpb_pb.DigitallySigned.SignatureAlgorithm
  ): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  hasPrivateKey(): boolean;
  clearPrivateKey(): void;
  getPrivateKey(): google_protobuf_any_pb.Any | undefined;
  setPrivateKey(value?: google_protobuf_any_pb.Any): void;

  hasStorageSettings(): boolean;
  clearStorageSettings(): void;
  getStorageSettings(): google_protobuf_any_pb.Any | undefined;
  setStorageSettings(value?: google_protobuf_any_pb.Any): void;

  hasPublicKey(): boolean;
  clearPublicKey(): void;
  getPublicKey(): crypto_keyspb_keyspb_pb.PublicKey | undefined;
  setPublicKey(value?: crypto_keyspb_keyspb_pb.PublicKey): void;

  hasMaxRootDuration(): boolean;
  clearMaxRootDuration(): void;
  getMaxRootDuration(): google_protobuf_duration_pb.Duration | undefined;
  setMaxRootDuration(value?: google_protobuf_duration_pb.Duration): void;

  hasCreateTime(): boolean;
  clearCreateTime(): void;
  getCreateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasUpdateTime(): boolean;
  clearUpdateTime(): void;
  getUpdateTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdateTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  getDeleted(): boolean;
  setDeleted(value: boolean): void;

  hasDeleteTime(): boolean;
  clearDeleteTime(): void;
  getDeleteTime(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setDeleteTime(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Tree.AsObject;
  static toObject(includeInstance: boolean, msg: Tree): Tree.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Tree,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): Tree;
  static deserializeBinaryFromReader(
    message: Tree,
    reader: jspb.BinaryReader
  ): Tree;
}

export namespace Tree {
  export type AsObject = {
    treeId: string;
    treeState: TreeState;
    treeType: TreeType;
    hashStrategy: HashStrategy;
    hashAlgorithm: crypto_sigpb_sigpb_pb.DigitallySigned.HashAlgorithm;
    signatureAlgorithm: crypto_sigpb_sigpb_pb.DigitallySigned.SignatureAlgorithm;
    displayName: string;
    description: string;
    privateKey?: google_protobuf_any_pb.Any.AsObject;
    storageSettings?: google_protobuf_any_pb.Any.AsObject;
    publicKey?: crypto_keyspb_keyspb_pb.PublicKey.AsObject;
    maxRootDuration?: google_protobuf_duration_pb.Duration.AsObject;
    createTime?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updateTime?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    deleted: boolean;
    deleteTime?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SignedEntryTimestamp extends jspb.Message {
  getTimestampNanos(): string;
  setTimestampNanos(value: string): void;

  getLogId(): string;
  setLogId(value: string): void;

  hasSignature(): boolean;
  clearSignature(): void;
  getSignature(): crypto_sigpb_sigpb_pb.DigitallySigned | undefined;
  setSignature(value?: crypto_sigpb_sigpb_pb.DigitallySigned): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignedEntryTimestamp.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SignedEntryTimestamp
  ): SignedEntryTimestamp.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SignedEntryTimestamp,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SignedEntryTimestamp;
  static deserializeBinaryFromReader(
    message: SignedEntryTimestamp,
    reader: jspb.BinaryReader
  ): SignedEntryTimestamp;
}

export namespace SignedEntryTimestamp {
  export type AsObject = {
    timestampNanos: string;
    logId: string;
    signature?: crypto_sigpb_sigpb_pb.DigitallySigned.AsObject;
  };
}

export class SignedLogRoot extends jspb.Message {
  getTimestampNanos(): string;
  setTimestampNanos(value: string): void;

  getRootHash(): Uint8Array | string;
  getRootHash_asU8(): Uint8Array;
  getRootHash_asB64(): string;
  setRootHash(value: Uint8Array | string): void;

  getTreeSize(): string;
  setTreeSize(value: string): void;

  getTreeRevision(): string;
  setTreeRevision(value: string): void;

  getKeyHint(): Uint8Array | string;
  getKeyHint_asU8(): Uint8Array;
  getKeyHint_asB64(): string;
  setKeyHint(value: Uint8Array | string): void;

  getLogRoot(): Uint8Array | string;
  getLogRoot_asU8(): Uint8Array;
  getLogRoot_asB64(): string;
  setLogRoot(value: Uint8Array | string): void;

  getLogRootSignature(): Uint8Array | string;
  getLogRootSignature_asU8(): Uint8Array;
  getLogRootSignature_asB64(): string;
  setLogRootSignature(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignedLogRoot.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SignedLogRoot
  ): SignedLogRoot.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SignedLogRoot,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SignedLogRoot;
  static deserializeBinaryFromReader(
    message: SignedLogRoot,
    reader: jspb.BinaryReader
  ): SignedLogRoot;
}

export namespace SignedLogRoot {
  export type AsObject = {
    timestampNanos: string;
    rootHash: Uint8Array | string;
    treeSize: string;
    treeRevision: string;
    keyHint: Uint8Array | string;
    logRoot: Uint8Array | string;
    logRootSignature: Uint8Array | string;
  };
}

export class SignedMapRoot extends jspb.Message {
  getMapRoot(): Uint8Array | string;
  getMapRoot_asU8(): Uint8Array;
  getMapRoot_asB64(): string;
  setMapRoot(value: Uint8Array | string): void;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignedMapRoot.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SignedMapRoot
  ): SignedMapRoot.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SignedMapRoot,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SignedMapRoot;
  static deserializeBinaryFromReader(
    message: SignedMapRoot,
    reader: jspb.BinaryReader
  ): SignedMapRoot;
}

export namespace SignedMapRoot {
  export type AsObject = {
    mapRoot: Uint8Array | string;
    signature: Uint8Array | string;
  };
}

export enum LogRootFormat {
  LOG_ROOT_FORMAT_UNKNOWN = 0,
  LOG_ROOT_FORMAT_V1 = 1
}

export enum MapRootFormat {
  MAP_ROOT_FORMAT_UNKNOWN = 0,
  MAP_ROOT_FORMAT_V1 = 1
}

export enum HashStrategy {
  UNKNOWN_HASH_STRATEGY = 0,
  RFC6962_SHA256 = 1,
  TEST_MAP_HASHER = 2,
  OBJECT_RFC6962_SHA256 = 3,
  CONIKS_SHA512_256 = 4
}

export enum TreeState {
  UNKNOWN_TREE_STATE = 0,
  ACTIVE = 1,
  FROZEN = 2,
  DEPRECATED_SOFT_DELETED = 3,
  DEPRECATED_HARD_DELETED = 4,
  DRAINING = 5
}

export enum TreeType {
  UNKNOWN_TREE_TYPE = 0,
  LOG = 1,
  MAP = 2,
  PREORDERED_LOG = 3
}
