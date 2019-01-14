// package: trillian
// file: trillian_log_api.proto

import * as jspb from "google-protobuf";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";
import * as google_rpc_status_pb from "../rpc/status_pb";
import * as trillian_pb from "./trillian_pb";

export class ChargeTo extends jspb.Message {
  clearUserList(): void;
  getUserList(): Array<string>;
  setUserList(value: Array<string>): void;
  addUser(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChargeTo.AsObject;
  static toObject(includeInstance: boolean, msg: ChargeTo): ChargeTo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ChargeTo,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ChargeTo;
  static deserializeBinaryFromReader(
    message: ChargeTo,
    reader: jspb.BinaryReader
  ): ChargeTo;
}

export namespace ChargeTo {
  export type AsObject = {
    userList: Array<string>;
  };
}

export class QueueLeafRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  hasLeaf(): boolean;
  clearLeaf(): void;
  getLeaf(): LogLeaf | undefined;
  setLeaf(value?: LogLeaf): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueueLeafRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: QueueLeafRequest
  ): QueueLeafRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: QueueLeafRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): QueueLeafRequest;
  static deserializeBinaryFromReader(
    message: QueueLeafRequest,
    reader: jspb.BinaryReader
  ): QueueLeafRequest;
}

export namespace QueueLeafRequest {
  export type AsObject = {
    logId: number;
    leaf?: LogLeaf.AsObject;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class QueueLeafResponse extends jspb.Message {
  hasQueuedLeaf(): boolean;
  clearQueuedLeaf(): void;
  getQueuedLeaf(): QueuedLogLeaf | undefined;
  setQueuedLeaf(value?: QueuedLogLeaf): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueueLeafResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: QueueLeafResponse
  ): QueueLeafResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: QueueLeafResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): QueueLeafResponse;
  static deserializeBinaryFromReader(
    message: QueueLeafResponse,
    reader: jspb.BinaryReader
  ): QueueLeafResponse;
}

export namespace QueueLeafResponse {
  export type AsObject = {
    queuedLeaf?: QueuedLogLeaf.AsObject;
  };
}

export class AddSequencedLeafRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  hasLeaf(): boolean;
  clearLeaf(): void;
  getLeaf(): LogLeaf | undefined;
  setLeaf(value?: LogLeaf): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSequencedLeafRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: AddSequencedLeafRequest
  ): AddSequencedLeafRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: AddSequencedLeafRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): AddSequencedLeafRequest;
  static deserializeBinaryFromReader(
    message: AddSequencedLeafRequest,
    reader: jspb.BinaryReader
  ): AddSequencedLeafRequest;
}

export namespace AddSequencedLeafRequest {
  export type AsObject = {
    logId: number;
    leaf?: LogLeaf.AsObject;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class AddSequencedLeafResponse extends jspb.Message {
  hasResult(): boolean;
  clearResult(): void;
  getResult(): QueuedLogLeaf | undefined;
  setResult(value?: QueuedLogLeaf): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSequencedLeafResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: AddSequencedLeafResponse
  ): AddSequencedLeafResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: AddSequencedLeafResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): AddSequencedLeafResponse;
  static deserializeBinaryFromReader(
    message: AddSequencedLeafResponse,
    reader: jspb.BinaryReader
  ): AddSequencedLeafResponse;
}

export namespace AddSequencedLeafResponse {
  export type AsObject = {
    result?: QueuedLogLeaf.AsObject;
  };
}

export class GetInclusionProofRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  getLeafIndex(): string;
  setLeafIndex(value: string): void;

  getTreeSize(): string;
  setTreeSize(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInclusionProofRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetInclusionProofRequest
  ): GetInclusionProofRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetInclusionProofRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetInclusionProofRequest;
  static deserializeBinaryFromReader(
    message: GetInclusionProofRequest,
    reader: jspb.BinaryReader
  ): GetInclusionProofRequest;
}

export namespace GetInclusionProofRequest {
  export type AsObject = {
    logId: string;
    leafIndex: string;
    treeSize: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetInclusionProofResponse extends jspb.Message {
  hasProof(): boolean;
  clearProof(): void;
  getProof(): Proof | undefined;
  setProof(value?: Proof): void;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInclusionProofResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetInclusionProofResponse
  ): GetInclusionProofResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetInclusionProofResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetInclusionProofResponse;
  static deserializeBinaryFromReader(
    message: GetInclusionProofResponse,
    reader: jspb.BinaryReader
  ): GetInclusionProofResponse;
}

export namespace GetInclusionProofResponse {
  export type AsObject = {
    proof?: Proof.AsObject;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetInclusionProofByHashRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  getLeafHash(): Uint8Array | string;
  getLeafHash_asU8(): Uint8Array;
  getLeafHash_asB64(): string;
  setLeafHash(value: Uint8Array | string): void;

  getTreeSize(): string;
  setTreeSize(value: string): void;

  getOrderBySequence(): boolean;
  setOrderBySequence(value: boolean): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInclusionProofByHashRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetInclusionProofByHashRequest
  ): GetInclusionProofByHashRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetInclusionProofByHashRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetInclusionProofByHashRequest;
  static deserializeBinaryFromReader(
    message: GetInclusionProofByHashRequest,
    reader: jspb.BinaryReader
  ): GetInclusionProofByHashRequest;
}

export namespace GetInclusionProofByHashRequest {
  export type AsObject = {
    logId: string;
    leafHash: Uint8Array | string;
    treeSize: string;
    orderBySequence: boolean;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetInclusionProofByHashResponse extends jspb.Message {
  clearProofList(): void;
  getProofList(): Array<Proof>;
  setProofList(value: Array<Proof>): void;
  addProof(value?: Proof, index?: number): Proof;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetInclusionProofByHashResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetInclusionProofByHashResponse
  ): GetInclusionProofByHashResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetInclusionProofByHashResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetInclusionProofByHashResponse;
  static deserializeBinaryFromReader(
    message: GetInclusionProofByHashResponse,
    reader: jspb.BinaryReader
  ): GetInclusionProofByHashResponse;
}

export namespace GetInclusionProofByHashResponse {
  export type AsObject = {
    proofList: Array<Proof.AsObject>;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetConsistencyProofRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  getFirstTreeSize(): string;
  setFirstTreeSize(value: string): void;

  getSecondTreeSize(): string;
  setSecondTreeSize(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetConsistencyProofRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetConsistencyProofRequest
  ): GetConsistencyProofRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetConsistencyProofRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetConsistencyProofRequest;
  static deserializeBinaryFromReader(
    message: GetConsistencyProofRequest,
    reader: jspb.BinaryReader
  ): GetConsistencyProofRequest;
}

export namespace GetConsistencyProofRequest {
  export type AsObject = {
    logId: string;
    firstTreeSize: string;
    secondTreeSize: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetConsistencyProofResponse extends jspb.Message {
  hasProof(): boolean;
  clearProof(): void;
  getProof(): Proof | undefined;
  setProof(value?: Proof): void;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetConsistencyProofResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetConsistencyProofResponse
  ): GetConsistencyProofResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetConsistencyProofResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetConsistencyProofResponse;
  static deserializeBinaryFromReader(
    message: GetConsistencyProofResponse,
    reader: jspb.BinaryReader
  ): GetConsistencyProofResponse;
}

export namespace GetConsistencyProofResponse {
  export type AsObject = {
    proof?: Proof.AsObject;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetLatestSignedLogRootRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLatestSignedLogRootRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLatestSignedLogRootRequest
  ): GetLatestSignedLogRootRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLatestSignedLogRootRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLatestSignedLogRootRequest;
  static deserializeBinaryFromReader(
    message: GetLatestSignedLogRootRequest,
    reader: jspb.BinaryReader
  ): GetLatestSignedLogRootRequest;
}

export namespace GetLatestSignedLogRootRequest {
  export type AsObject = {
    logId: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetLatestSignedLogRootResponse extends jspb.Message {
  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLatestSignedLogRootResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLatestSignedLogRootResponse
  ): GetLatestSignedLogRootResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLatestSignedLogRootResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLatestSignedLogRootResponse;
  static deserializeBinaryFromReader(
    message: GetLatestSignedLogRootResponse,
    reader: jspb.BinaryReader
  ): GetLatestSignedLogRootResponse;
}

export namespace GetLatestSignedLogRootResponse {
  export type AsObject = {
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetSequencedLeafCountRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSequencedLeafCountRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetSequencedLeafCountRequest
  ): GetSequencedLeafCountRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetSequencedLeafCountRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetSequencedLeafCountRequest;
  static deserializeBinaryFromReader(
    message: GetSequencedLeafCountRequest,
    reader: jspb.BinaryReader
  ): GetSequencedLeafCountRequest;
}

export namespace GetSequencedLeafCountRequest {
  export type AsObject = {
    logId: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetSequencedLeafCountResponse extends jspb.Message {
  getLeafCount(): string;
  setLeafCount(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSequencedLeafCountResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetSequencedLeafCountResponse
  ): GetSequencedLeafCountResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetSequencedLeafCountResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetSequencedLeafCountResponse;
  static deserializeBinaryFromReader(
    message: GetSequencedLeafCountResponse,
    reader: jspb.BinaryReader
  ): GetSequencedLeafCountResponse;
}

export namespace GetSequencedLeafCountResponse {
  export type AsObject = {
    leafCount: string;
  };
}

export class GetEntryAndProofRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  getLeafIndex(): string;
  setLeafIndex(value: string): void;

  getTreeSize(): string;
  setTreeSize(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetEntryAndProofRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetEntryAndProofRequest
  ): GetEntryAndProofRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetEntryAndProofRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetEntryAndProofRequest;
  static deserializeBinaryFromReader(
    message: GetEntryAndProofRequest,
    reader: jspb.BinaryReader
  ): GetEntryAndProofRequest;
}

export namespace GetEntryAndProofRequest {
  export type AsObject = {
    logId: string;
    leafIndex: string;
    treeSize: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetEntryAndProofResponse extends jspb.Message {
  hasProof(): boolean;
  clearProof(): void;
  getProof(): Proof | undefined;
  setProof(value?: Proof): void;

  hasLeaf(): boolean;
  clearLeaf(): void;
  getLeaf(): LogLeaf | undefined;
  setLeaf(value?: LogLeaf): void;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetEntryAndProofResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetEntryAndProofResponse
  ): GetEntryAndProofResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetEntryAndProofResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetEntryAndProofResponse;
  static deserializeBinaryFromReader(
    message: GetEntryAndProofResponse,
    reader: jspb.BinaryReader
  ): GetEntryAndProofResponse;
}

export namespace GetEntryAndProofResponse {
  export type AsObject = {
    proof?: Proof.AsObject;
    leaf?: LogLeaf.AsObject;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class InitLogRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitLogRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: InitLogRequest
  ): InitLogRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: InitLogRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): InitLogRequest;
  static deserializeBinaryFromReader(
    message: InitLogRequest,
    reader: jspb.BinaryReader
  ): InitLogRequest;
}

export namespace InitLogRequest {
  export type AsObject = {
    logId: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class InitLogResponse extends jspb.Message {
  hasCreated(): boolean;
  clearCreated(): void;
  getCreated(): trillian_pb.SignedLogRoot | undefined;
  setCreated(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitLogResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: InitLogResponse
  ): InitLogResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: InitLogResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): InitLogResponse;
  static deserializeBinaryFromReader(
    message: InitLogResponse,
    reader: jspb.BinaryReader
  ): InitLogResponse;
}

export namespace InitLogResponse {
  export type AsObject = {
    created?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class QueueLeavesRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  clearLeavesList(): void;
  getLeavesList(): Array<LogLeaf>;
  setLeavesList(value: Array<LogLeaf>): void;
  addLeaves(value?: LogLeaf, index?: number): LogLeaf;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueueLeavesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: QueueLeavesRequest
  ): QueueLeavesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: QueueLeavesRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): QueueLeavesRequest;
  static deserializeBinaryFromReader(
    message: QueueLeavesRequest,
    reader: jspb.BinaryReader
  ): QueueLeavesRequest;
}

export namespace QueueLeavesRequest {
  export type AsObject = {
    logId: string;
    leavesList: Array<LogLeaf.AsObject>;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class QueueLeavesResponse extends jspb.Message {
  clearQueuedLeavesList(): void;
  getQueuedLeavesList(): Array<QueuedLogLeaf>;
  setQueuedLeavesList(value: Array<QueuedLogLeaf>): void;
  addQueuedLeaves(value?: QueuedLogLeaf, index?: number): QueuedLogLeaf;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueueLeavesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: QueueLeavesResponse
  ): QueueLeavesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: QueueLeavesResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): QueueLeavesResponse;
  static deserializeBinaryFromReader(
    message: QueueLeavesResponse,
    reader: jspb.BinaryReader
  ): QueueLeavesResponse;
}

export namespace QueueLeavesResponse {
  export type AsObject = {
    queuedLeavesList: Array<QueuedLogLeaf.AsObject>;
  };
}

export class AddSequencedLeavesRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  clearLeavesList(): void;
  getLeavesList(): Array<LogLeaf>;
  setLeavesList(value: Array<LogLeaf>): void;
  addLeaves(value?: LogLeaf, index?: number): LogLeaf;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSequencedLeavesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: AddSequencedLeavesRequest
  ): AddSequencedLeavesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: AddSequencedLeavesRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): AddSequencedLeavesRequest;
  static deserializeBinaryFromReader(
    message: AddSequencedLeavesRequest,
    reader: jspb.BinaryReader
  ): AddSequencedLeavesRequest;
}

export namespace AddSequencedLeavesRequest {
  export type AsObject = {
    logId: string;
    leavesList: Array<LogLeaf.AsObject>;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class AddSequencedLeavesResponse extends jspb.Message {
  clearResultsList(): void;
  getResultsList(): Array<QueuedLogLeaf>;
  setResultsList(value: Array<QueuedLogLeaf>): void;
  addResults(value?: QueuedLogLeaf, index?: number): QueuedLogLeaf;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddSequencedLeavesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: AddSequencedLeavesResponse
  ): AddSequencedLeavesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: AddSequencedLeavesResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): AddSequencedLeavesResponse;
  static deserializeBinaryFromReader(
    message: AddSequencedLeavesResponse,
    reader: jspb.BinaryReader
  ): AddSequencedLeavesResponse;
}

export namespace AddSequencedLeavesResponse {
  export type AsObject = {
    resultsList: Array<QueuedLogLeaf.AsObject>;
  };
}

export class GetLeavesByIndexRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  clearLeafIndexList(): void;
  getLeafIndexList(): Array<string>;
  setLeafIndexList(value: Array<string>): void;
  addLeafIndex(value: string, index?: number): number;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByIndexRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByIndexRequest
  ): GetLeavesByIndexRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByIndexRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByIndexRequest;
  static deserializeBinaryFromReader(
    message: GetLeavesByIndexRequest,
    reader: jspb.BinaryReader
  ): GetLeavesByIndexRequest;
}

export namespace GetLeavesByIndexRequest {
  export type AsObject = {
    logId: string;
    leafIndexList: Array<number>;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetLeavesByIndexResponse extends jspb.Message {
  clearLeavesList(): void;
  getLeavesList(): Array<LogLeaf>;
  setLeavesList(value: Array<LogLeaf>): void;
  addLeaves(value?: LogLeaf, index?: number): LogLeaf;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByIndexResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByIndexResponse
  ): GetLeavesByIndexResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByIndexResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByIndexResponse;
  static deserializeBinaryFromReader(
    message: GetLeavesByIndexResponse,
    reader: jspb.BinaryReader
  ): GetLeavesByIndexResponse;
}

export namespace GetLeavesByIndexResponse {
  export type AsObject = {
    leavesList: Array<LogLeaf.AsObject>;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetLeavesByRangeRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  getStartIndex(): string;
  setStartIndex(value: string): void;

  getCount(): string;
  setCount(value: string): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByRangeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByRangeRequest
  ): GetLeavesByRangeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByRangeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByRangeRequest;
  static deserializeBinaryFromReader(
    message: GetLeavesByRangeRequest,
    reader: jspb.BinaryReader
  ): GetLeavesByRangeRequest;
}

export namespace GetLeavesByRangeRequest {
  export type AsObject = {
    logId: string;
    startIndex: string;
    count: string;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetLeavesByRangeResponse extends jspb.Message {
  clearLeavesList(): void;
  getLeavesList(): Array<LogLeaf>;
  setLeavesList(value: Array<LogLeaf>): void;
  addLeaves(value?: LogLeaf, index?: number): LogLeaf;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByRangeResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByRangeResponse
  ): GetLeavesByRangeResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByRangeResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByRangeResponse;
  static deserializeBinaryFromReader(
    message: GetLeavesByRangeResponse,
    reader: jspb.BinaryReader
  ): GetLeavesByRangeResponse;
}

export namespace GetLeavesByRangeResponse {
  export type AsObject = {
    leavesList: Array<LogLeaf.AsObject>;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class GetLeavesByHashRequest extends jspb.Message {
  getLogId(): string;
  setLogId(value: string): void;

  clearLeafHashList(): void;
  getLeafHashList(): Array<Uint8Array | string>;
  getLeafHashList_asU8(): Array<Uint8Array>;
  getLeafHashList_asB64(): Array<string>;
  setLeafHashList(value: Array<Uint8Array | string>): void;
  addLeafHash(value: Uint8Array | string, index?: number): Uint8Array | string;

  getOrderBySequence(): boolean;
  setOrderBySequence(value: boolean): void;

  hasChargeTo(): boolean;
  clearChargeTo(): void;
  getChargeTo(): ChargeTo | undefined;
  setChargeTo(value?: ChargeTo): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByHashRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByHashRequest
  ): GetLeavesByHashRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByHashRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByHashRequest;
  static deserializeBinaryFromReader(
    message: GetLeavesByHashRequest,
    reader: jspb.BinaryReader
  ): GetLeavesByHashRequest;
}

export namespace GetLeavesByHashRequest {
  export type AsObject = {
    logId: string;
    leafHashList: Array<Uint8Array | string>;
    orderBySequence: boolean;
    chargeTo?: ChargeTo.AsObject;
  };
}

export class GetLeavesByHashResponse extends jspb.Message {
  clearLeavesList(): void;
  getLeavesList(): Array<LogLeaf>;
  setLeavesList(value: Array<LogLeaf>): void;
  addLeaves(value?: LogLeaf, index?: number): LogLeaf;

  hasSignedLogRoot(): boolean;
  clearSignedLogRoot(): void;
  getSignedLogRoot(): trillian_pb.SignedLogRoot | undefined;
  setSignedLogRoot(value?: trillian_pb.SignedLogRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetLeavesByHashResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetLeavesByHashResponse
  ): GetLeavesByHashResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetLeavesByHashResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetLeavesByHashResponse;
  static deserializeBinaryFromReader(
    message: GetLeavesByHashResponse,
    reader: jspb.BinaryReader
  ): GetLeavesByHashResponse;
}

export namespace GetLeavesByHashResponse {
  export type AsObject = {
    leavesList: Array<LogLeaf.AsObject>;
    signedLogRoot?: trillian_pb.SignedLogRoot.AsObject;
  };
}

export class QueuedLogLeaf extends jspb.Message {
  hasLeaf(): boolean;
  clearLeaf(): void;
  getLeaf(): LogLeaf | undefined;
  setLeaf(value?: LogLeaf): void;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): google_rpc_status_pb.Status | undefined;
  setStatus(value?: google_rpc_status_pb.Status): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueuedLogLeaf.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: QueuedLogLeaf
  ): QueuedLogLeaf.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: QueuedLogLeaf,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): QueuedLogLeaf;
  static deserializeBinaryFromReader(
    message: QueuedLogLeaf,
    reader: jspb.BinaryReader
  ): QueuedLogLeaf;
}

export namespace QueuedLogLeaf {
  export type AsObject = {
    leaf?: LogLeaf.AsObject;
    status?: google_rpc_status_pb.Status.AsObject;
  };
}

export class LogLeaf extends jspb.Message {
  getMerkleLeafHash(): Uint8Array | string;
  getMerkleLeafHash_asU8(): Uint8Array;
  getMerkleLeafHash_asB64(): string;
  setMerkleLeafHash(value: Uint8Array | string): void;

  getLeafValue(): Uint8Array | string;
  getLeafValue_asU8(): Uint8Array;
  getLeafValue_asB64(): string;
  setLeafValue(value: Uint8Array | string): void;

  getExtraData(): Uint8Array | string;
  getExtraData_asU8(): Uint8Array;
  getExtraData_asB64(): string;
  setExtraData(value: Uint8Array | string): void;

  getLeafIndex(): string;
  setLeafIndex(value: string): void;

  getLeafIdentityHash(): Uint8Array | string;
  getLeafIdentityHash_asU8(): Uint8Array;
  getLeafIdentityHash_asB64(): string;
  setLeafIdentityHash(value: Uint8Array | string): void;

  hasQueueTimestamp(): boolean;
  clearQueueTimestamp(): void;
  getQueueTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setQueueTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): void;

  hasIntegrateTimestamp(): boolean;
  clearIntegrateTimestamp(): void;
  getIntegrateTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setIntegrateTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogLeaf.AsObject;
  static toObject(includeInstance: boolean, msg: LogLeaf): LogLeaf.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: LogLeaf,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): LogLeaf;
  static deserializeBinaryFromReader(
    message: LogLeaf,
    reader: jspb.BinaryReader
  ): LogLeaf;
}

export namespace LogLeaf {
  export type AsObject = {
    merkleLeafHash: Uint8Array | string;
    leafValue: Uint8Array | string;
    extraData: Uint8Array | string;
    leafIndex: string;
    leafIdentityHash: Uint8Array | string;
    queueTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    integrateTimestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class Proof extends jspb.Message {
  getLeafIndex(): string;
  setLeafIndex(value: string): void;

  clearHashesList(): void;
  getHashesList(): Array<Uint8Array | string>;
  getHashesList_asU8(): Array<Uint8Array>;
  getHashesList_asB64(): Array<string>;
  setHashesList(value: Array<Uint8Array | string>): void;
  addHashes(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Proof.AsObject;
  static toObject(includeInstance: boolean, msg: Proof): Proof.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Proof,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): Proof;
  static deserializeBinaryFromReader(
    message: Proof,
    reader: jspb.BinaryReader
  ): Proof;
}

export namespace Proof {
  export type AsObject = {
    leafIndex: string;
    hashesList: Array<Uint8Array | string>;
  };
}
