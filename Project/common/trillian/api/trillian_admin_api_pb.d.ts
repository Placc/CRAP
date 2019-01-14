// package: trillian
// file: trillian_admin_api.proto

import * as jspb from "google-protobuf";
import * as trillian_pb from "./trillian_pb";
import * as crypto_keyspb_keyspb_pb from "../crypto/keyspb/keyspb_pb";
import * as google_protobuf_field_mask_pb from "google-protobuf/google/protobuf/field_mask_pb";

export class ListTreesRequest extends jspb.Message {
  getShowDeleted(): boolean;
  setShowDeleted(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTreesRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListTreesRequest
  ): ListTreesRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListTreesRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListTreesRequest;
  static deserializeBinaryFromReader(
    message: ListTreesRequest,
    reader: jspb.BinaryReader
  ): ListTreesRequest;
}

export namespace ListTreesRequest {
  export type AsObject = {
    showDeleted: boolean;
  };
}

export class ListTreesResponse extends jspb.Message {
  clearTreeList(): void;
  getTreeList(): Array<trillian_pb.Tree>;
  setTreeList(value: Array<trillian_pb.Tree>): void;
  addTree(value?: trillian_pb.Tree, index?: number): trillian_pb.Tree;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListTreesResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListTreesResponse
  ): ListTreesResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListTreesResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListTreesResponse;
  static deserializeBinaryFromReader(
    message: ListTreesResponse,
    reader: jspb.BinaryReader
  ): ListTreesResponse;
}

export namespace ListTreesResponse {
  export type AsObject = {
    treeList: Array<trillian_pb.Tree.AsObject>;
  };
}

export class GetTreeRequest extends jspb.Message {
  getTreeId(): string;
  setTreeId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetTreeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetTreeRequest
  ): GetTreeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetTreeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): GetTreeRequest;
  static deserializeBinaryFromReader(
    message: GetTreeRequest,
    reader: jspb.BinaryReader
  ): GetTreeRequest;
}

export namespace GetTreeRequest {
  export type AsObject = {
    treeId: string;
  };
}

export class CreateTreeRequest extends jspb.Message {
  hasTree(): boolean;
  clearTree(): void;
  getTree(): trillian_pb.Tree | undefined;
  setTree(value?: trillian_pb.Tree): void;

  hasKeySpec(): boolean;
  clearKeySpec(): void;
  getKeySpec(): crypto_keyspb_keyspb_pb.Specification | undefined;
  setKeySpec(value?: crypto_keyspb_keyspb_pb.Specification): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateTreeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: CreateTreeRequest
  ): CreateTreeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: CreateTreeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): CreateTreeRequest;
  static deserializeBinaryFromReader(
    message: CreateTreeRequest,
    reader: jspb.BinaryReader
  ): CreateTreeRequest;
}

export namespace CreateTreeRequest {
  export type AsObject = {
    tree?: trillian_pb.Tree.AsObject;
    keySpec?: crypto_keyspb_keyspb_pb.Specification.AsObject;
  };
}

export class UpdateTreeRequest extends jspb.Message {
  hasTree(): boolean;
  clearTree(): void;
  getTree(): trillian_pb.Tree | undefined;
  setTree(value?: trillian_pb.Tree): void;

  hasUpdateMask(): boolean;
  clearUpdateMask(): void;
  getUpdateMask(): google_protobuf_field_mask_pb.FieldMask | undefined;
  setUpdateMask(value?: google_protobuf_field_mask_pb.FieldMask): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTreeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: UpdateTreeRequest
  ): UpdateTreeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: UpdateTreeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTreeRequest;
  static deserializeBinaryFromReader(
    message: UpdateTreeRequest,
    reader: jspb.BinaryReader
  ): UpdateTreeRequest;
}

export namespace UpdateTreeRequest {
  export type AsObject = {
    tree?: trillian_pb.Tree.AsObject;
    updateMask?: google_protobuf_field_mask_pb.FieldMask.AsObject;
  };
}

export class DeleteTreeRequest extends jspb.Message {
  getTreeId(): string;
  setTreeId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteTreeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: DeleteTreeRequest
  ): DeleteTreeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: DeleteTreeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): DeleteTreeRequest;
  static deserializeBinaryFromReader(
    message: DeleteTreeRequest,
    reader: jspb.BinaryReader
  ): DeleteTreeRequest;
}

export namespace DeleteTreeRequest {
  export type AsObject = {
    treeId: string;
  };
}

export class UndeleteTreeRequest extends jspb.Message {
  getTreeId(): string;
  setTreeId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UndeleteTreeRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: UndeleteTreeRequest
  ): UndeleteTreeRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: UndeleteTreeRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): UndeleteTreeRequest;
  static deserializeBinaryFromReader(
    message: UndeleteTreeRequest,
    reader: jspb.BinaryReader
  ): UndeleteTreeRequest;
}

export namespace UndeleteTreeRequest {
  export type AsObject = {
    treeId: string;
  };
}
