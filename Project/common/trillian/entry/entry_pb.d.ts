// package: entrypb
// file: entry.proto

import * as jspb from "google-protobuf";

export class MapEntry extends jspb.Message {
  getDomain(): string;
  setDomain(value: string): void;

  getCert(): string;
  setCert(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MapEntry.AsObject;
  static toObject(includeInstance: boolean, msg: MapEntry): MapEntry.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MapEntry,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): MapEntry;
  static deserializeBinaryFromReader(
    message: MapEntry,
    reader: jspb.BinaryReader
  ): MapEntry;
}

export namespace MapEntry {
  export type AsObject = {
    domain: string;
    cert: string;
  };
}

export class LogEntry extends jspb.Message {
  getDomain(): string;
  setDomain(value: string): void;

  getOperation(): Operation;
  setOperation(value: Operation): void;

  getCert(): string;
  setCert(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogEntry.AsObject;
  static toObject(includeInstance: boolean, msg: LogEntry): LogEntry.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: LogEntry,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): LogEntry;
  static deserializeBinaryFromReader(
    message: LogEntry,
    reader: jspb.BinaryReader
  ): LogEntry;
}

export namespace LogEntry {
  export type AsObject = {
    domain: string;
    operation: Operation;
    cert: string;
  };
}

export enum Operation {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2
}
