// package: keyspb
// file: crypto/keyspb/keyspb.proto

import * as jspb from 'google-protobuf';

export class Specification extends jspb.Message {
  hasEcdsaParams(): boolean;
  clearEcdsaParams(): void;
  getEcdsaParams(): Specification.ECDSA | undefined;
  setEcdsaParams(value?: Specification.ECDSA): void;

  hasRsaParams(): boolean;
  clearRsaParams(): void;
  getRsaParams(): Specification.RSA | undefined;
  setRsaParams(value?: Specification.RSA): void;

  getParamsCase(): Specification.ParamsCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Specification.AsObject;
  static toObject(includeInstance: boolean, msg: Specification): Specification.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Specification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Specification;
  static deserializeBinaryFromReader(message: Specification, reader: jspb.BinaryReader): Specification;
}

export namespace Specification {
  export type AsObject = {
    ecdsaParams?: Specification.ECDSA.AsObject,
    rsaParams?: Specification.RSA.AsObject,
  }

  export class ECDSA extends jspb.Message {
    getCurve(): Specification.ECDSA.Curve;
    setCurve(value: Specification.ECDSA.Curve): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ECDSA.AsObject;
    static toObject(includeInstance: boolean, msg: ECDSA): ECDSA.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ECDSA, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ECDSA;
    static deserializeBinaryFromReader(message: ECDSA, reader: jspb.BinaryReader): ECDSA;
  }

  export namespace ECDSA {
    export type AsObject = {
      curve: Specification.ECDSA.Curve,
    }

    export enum Curve {
      DEFAULT_CURVE = 0,
      P256 = 1,
      P384 = 2,
      P521 = 3,
    }
  }

  export class RSA extends jspb.Message {
    getBits(): number;
    setBits(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RSA.AsObject;
    static toObject(includeInstance: boolean, msg: RSA): RSA.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RSA, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RSA;
    static deserializeBinaryFromReader(message: RSA, reader: jspb.BinaryReader): RSA;
  }

  export namespace RSA {
    export type AsObject = {
      bits: number,
    }
  }

  export enum ParamsCase {
    PARAMS_NOT_SET = 0,
    PARAMS_1 = 1,
    PARAMS_2 = 2,
  }
}

export class PEMKeyFile extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  getPassword(): string;
  setPassword(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PEMKeyFile.AsObject;
  static toObject(includeInstance: boolean, msg: PEMKeyFile): PEMKeyFile.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PEMKeyFile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PEMKeyFile;
  static deserializeBinaryFromReader(message: PEMKeyFile, reader: jspb.BinaryReader): PEMKeyFile;
}

export namespace PEMKeyFile {
  export type AsObject = {
    path: string,
    password: string,
  }
}

export class PrivateKey extends jspb.Message {
  getDer(): Uint8Array | string;
  getDer_asU8(): Uint8Array;
  getDer_asB64(): string;
  setDer(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrivateKey.AsObject;
  static toObject(includeInstance: boolean, msg: PrivateKey): PrivateKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrivateKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrivateKey;
  static deserializeBinaryFromReader(message: PrivateKey, reader: jspb.BinaryReader): PrivateKey;
}

export namespace PrivateKey {
  export type AsObject = {
    der: Uint8Array | string,
  }
}

export class PublicKey extends jspb.Message {
  getDer(): Uint8Array | string;
  getDer_asU8(): Uint8Array;
  getDer_asB64(): string;
  setDer(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublicKey.AsObject;
  static toObject(includeInstance: boolean, msg: PublicKey): PublicKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PublicKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublicKey;
  static deserializeBinaryFromReader(message: PublicKey, reader: jspb.BinaryReader): PublicKey;
}

export namespace PublicKey {
  export type AsObject = {
    der: Uint8Array | string,
  }
}

export class PKCS11Config extends jspb.Message {
  getTokenLabel(): string;
  setTokenLabel(value: string): void;

  getPin(): string;
  setPin(value: string): void;

  getPublicKey(): string;
  setPublicKey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PKCS11Config.AsObject;
  static toObject(includeInstance: boolean, msg: PKCS11Config): PKCS11Config.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PKCS11Config, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PKCS11Config;
  static deserializeBinaryFromReader(message: PKCS11Config, reader: jspb.BinaryReader): PKCS11Config;
}

export namespace PKCS11Config {
  export type AsObject = {
    tokenLabel: string,
    pin: string,
    publicKey: string,
  }
}

