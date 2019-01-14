// package: sigpb
// file: crypto/sigpb/sigpb.proto

import * as jspb from 'google-protobuf';

export class DigitallySigned extends jspb.Message {
  getHashAlgorithm(): DigitallySigned.HashAlgorithm;
  setHashAlgorithm(value: DigitallySigned.HashAlgorithm): void;

  getSignatureAlgorithm(): DigitallySigned.SignatureAlgorithm;
  setSignatureAlgorithm(value: DigitallySigned.SignatureAlgorithm): void;

  getSignature(): Uint8Array | string;
  getSignature_asU8(): Uint8Array;
  getSignature_asB64(): string;
  setSignature(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DigitallySigned.AsObject;
  static toObject(includeInstance: boolean, msg: DigitallySigned): DigitallySigned.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DigitallySigned, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DigitallySigned;
  static deserializeBinaryFromReader(message: DigitallySigned, reader: jspb.BinaryReader): DigitallySigned;
}

export namespace DigitallySigned {
  export type AsObject = {
    hashAlgorithm: DigitallySigned.HashAlgorithm,
    signatureAlgorithm: DigitallySigned.SignatureAlgorithm,
    signature: Uint8Array | string,
  }

  export enum HashAlgorithm {
    NONE = 0,
    SHA256 = 4,
  }

  export enum SignatureAlgorithm {
    ANONYMOUS = 0,
    RSA = 1,
    ECDSA = 3,
  }
}

