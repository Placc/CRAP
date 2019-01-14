// package: trillian
// file: trillian_map_api.proto

import * as jspb from "google-protobuf";
import * as trillian_pb from "./trillian_pb";

export class MapLeaf extends jspb.Message {
  getIndex(): Uint8Array | string;
  getIndex_asU8(): Uint8Array;
  getIndex_asB64(): string;
  setIndex(value: Uint8Array | string): void;

  getLeafHash(): Uint8Array | string;
  getLeafHash_asU8(): Uint8Array;
  getLeafHash_asB64(): string;
  setLeafHash(value: Uint8Array | string): void;

  getLeafValue(): Uint8Array | string;
  getLeafValue_asU8(): Uint8Array;
  getLeafValue_asB64(): string;
  setLeafValue(value: Uint8Array | string): void;

  getExtraData(): Uint8Array | string;
  getExtraData_asU8(): Uint8Array;
  getExtraData_asB64(): string;
  setExtraData(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MapLeaf.AsObject;
  static toObject(includeInstance: boolean, msg: MapLeaf): MapLeaf.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MapLeaf,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): MapLeaf;
  static deserializeBinaryFromReader(
    message: MapLeaf,
    reader: jspb.BinaryReader
  ): MapLeaf;
}

export namespace MapLeaf {
  export type AsObject = {
    index: Uint8Array | string;
    leafHash: Uint8Array | string;
    leafValue: Uint8Array | string;
    extraData: Uint8Array | string;
  };
}

export class MapLeafInclusion extends jspb.Message {
  hasLeaf(): boolean;
  clearLeaf(): void;
  getLeaf(): MapLeaf | undefined;
  setLeaf(value?: MapLeaf): void;

  clearInclusionList(): void;
  getInclusionList(): Array<Uint8Array | string>;
  getInclusionList_asU8(): Array<Uint8Array>;
  getInclusionList_asB64(): Array<string>;
  setInclusionList(value: Array<Uint8Array | string>): void;
  addInclusion(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MapLeafInclusion.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: MapLeafInclusion
  ): MapLeafInclusion.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MapLeafInclusion,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): MapLeafInclusion;
  static deserializeBinaryFromReader(
    message: MapLeafInclusion,
    reader: jspb.BinaryReader
  ): MapLeafInclusion;
}

export namespace MapLeafInclusion {
  export type AsObject = {
    leaf?: MapLeaf.AsObject;
    inclusionList: Array<Uint8Array | string>;
  };
}

export class GetMapLeavesRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  clearIndexList(): void;
  getIndexList(): Array<Uint8Array | string>;
  getIndexList_asU8(): Array<Uint8Array>;
  getIndexList_asB64(): Array<string>;
  setIndexList(value: Array<Uint8Array | string>): void;
  addIndex(value: Uint8Array | string, index?: number): Uint8Array | string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMapLeavesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetMapLeavesRequest
  ): GetMapLeavesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetMapLeavesRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetMapLeavesRequest;
  static deserializeBinaryFromReader(
    message: GetMapLeavesRequest,
    reader: jspb.BinaryReader
  ): GetMapLeavesRequest;
}

export namespace GetMapLeavesRequest {
  export type AsObject = {
    mapId: string;
    indexList: Array<Uint8Array | string>;
  };
}

export class GetMapLeavesByRevisionRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  clearIndexList(): void;
  getIndexList(): Array<Uint8Array | string>;
  getIndexList_asU8(): Array<Uint8Array>;
  getIndexList_asB64(): Array<string>;
  setIndexList(value: Array<Uint8Array | string>): void;
  addIndex(value: Uint8Array | string, index?: number): Uint8Array | string;

  getRevision(): string;
  setRevision(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMapLeavesByRevisionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetMapLeavesByRevisionRequest
  ): GetMapLeavesByRevisionRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetMapLeavesByRevisionRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetMapLeavesByRevisionRequest;
  static deserializeBinaryFromReader(
    message: GetMapLeavesByRevisionRequest,
    reader: jspb.BinaryReader
  ): GetMapLeavesByRevisionRequest;
}

export namespace GetMapLeavesByRevisionRequest {
  export type AsObject = {
    mapId: string;
    indexList: Array<Uint8Array | string>;
    revision: string;
  };
}

export class GetMapLeavesResponse extends jspb.Message {
  clearMapLeafInclusionList(): void;
  getMapLeafInclusionList(): Array<MapLeafInclusion>;
  setMapLeafInclusionList(value: Array<MapLeafInclusion>): void;
  addMapLeafInclusion(
    value?: MapLeafInclusion,
    index?: number
  ): MapLeafInclusion;

  hasMapRoot(): boolean;
  clearMapRoot(): void;
  getMapRoot(): trillian_pb.SignedMapRoot | undefined;
  setMapRoot(value?: trillian_pb.SignedMapRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMapLeavesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetMapLeavesResponse
  ): GetMapLeavesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetMapLeavesResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetMapLeavesResponse;
  static deserializeBinaryFromReader(
    message: GetMapLeavesResponse,
    reader: jspb.BinaryReader
  ): GetMapLeavesResponse;
}

export namespace GetMapLeavesResponse {
  export type AsObject = {
    mapLeafInclusionList: Array<MapLeafInclusion.AsObject>;
    mapRoot?: trillian_pb.SignedMapRoot.AsObject;
  };
}

export class SetMapLeavesRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  clearLeavesList(): void;
  getLeavesList(): Array<MapLeaf>;
  setLeavesList(value: Array<MapLeaf>): void;
  addLeaves(value?: MapLeaf, index?: number): MapLeaf;

  getMetadata(): Uint8Array | string;
  getMetadata_asU8(): Uint8Array;
  getMetadata_asB64(): string;
  setMetadata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetMapLeavesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SetMapLeavesRequest
  ): SetMapLeavesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SetMapLeavesRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SetMapLeavesRequest;
  static deserializeBinaryFromReader(
    message: SetMapLeavesRequest,
    reader: jspb.BinaryReader
  ): SetMapLeavesRequest;
}

export namespace SetMapLeavesRequest {
  export type AsObject = {
    mapId: string;
    leavesList: Array<MapLeaf.AsObject>;
    metadata: Uint8Array | string;
  };
}

export class SetMapLeavesResponse extends jspb.Message {
  hasMapRoot(): boolean;
  clearMapRoot(): void;
  getMapRoot(): trillian_pb.SignedMapRoot | undefined;
  setMapRoot(value?: trillian_pb.SignedMapRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetMapLeavesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SetMapLeavesResponse
  ): SetMapLeavesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SetMapLeavesResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SetMapLeavesResponse;
  static deserializeBinaryFromReader(
    message: SetMapLeavesResponse,
    reader: jspb.BinaryReader
  ): SetMapLeavesResponse;
}

export namespace SetMapLeavesResponse {
  export type AsObject = {
    mapRoot?: trillian_pb.SignedMapRoot.AsObject;
  };
}

export class GetSignedMapRootRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSignedMapRootRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetSignedMapRootRequest
  ): GetSignedMapRootRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetSignedMapRootRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetSignedMapRootRequest;
  static deserializeBinaryFromReader(
    message: GetSignedMapRootRequest,
    reader: jspb.BinaryReader
  ): GetSignedMapRootRequest;
}

export namespace GetSignedMapRootRequest {
  export type AsObject = {
    mapId: string;
  };
}

export class GetSignedMapRootByRevisionRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  getRevision(): string;
  setRevision(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(
    includeInstance?: boolean
  ): GetSignedMapRootByRevisionRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetSignedMapRootByRevisionRequest
  ): GetSignedMapRootByRevisionRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetSignedMapRootByRevisionRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(
    bytes: Uint8Array
  ): GetSignedMapRootByRevisionRequest;
  static deserializeBinaryFromReader(
    message: GetSignedMapRootByRevisionRequest,
    reader: jspb.BinaryReader
  ): GetSignedMapRootByRevisionRequest;
}

export namespace GetSignedMapRootByRevisionRequest {
  export type AsObject = {
    mapId: string;
    revision: string;
  };
}

export class GetSignedMapRootResponse extends jspb.Message {
  hasMapRoot(): boolean;
  clearMapRoot(): void;
  getMapRoot(): trillian_pb.SignedMapRoot | undefined;
  setMapRoot(value?: trillian_pb.SignedMapRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSignedMapRootResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetSignedMapRootResponse
  ): GetSignedMapRootResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetSignedMapRootResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetSignedMapRootResponse;
  static deserializeBinaryFromReader(
    message: GetSignedMapRootResponse,
    reader: jspb.BinaryReader
  ): GetSignedMapRootResponse;
}

export namespace GetSignedMapRootResponse {
  export type AsObject = {
    mapRoot?: trillian_pb.SignedMapRoot.AsObject;
  };
}

export class InitMapRequest extends jspb.Message {
  getMapId(): string;
  setMapId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitMapRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: InitMapRequest
  ): InitMapRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: InitMapRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): InitMapRequest;
  static deserializeBinaryFromReader(
    message: InitMapRequest,
    reader: jspb.BinaryReader
  ): InitMapRequest;
}

export namespace InitMapRequest {
  export type AsObject = {
    mapId: string;
  };
}

export class InitMapResponse extends jspb.Message {
  hasCreated(): boolean;
  clearCreated(): void;
  getCreated(): trillian_pb.SignedMapRoot | undefined;
  setCreated(value?: trillian_pb.SignedMapRoot): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitMapResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: InitMapResponse
  ): InitMapResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: InitMapResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): InitMapResponse;
  static deserializeBinaryFromReader(
    message: InitMapResponse,
    reader: jspb.BinaryReader
  ): InitMapResponse;
}

export namespace InitMapResponse {
  export type AsObject = {
    created?: trillian_pb.SignedMapRoot.AsObject;
  };
}
