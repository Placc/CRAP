import NodeRSA from "node-rsa";
import { Signed, CryptoKey } from "./types";
import { Omit } from "../util/types";
import { getHash } from "../util/funs";

export function encryptPrivate(data: string, privateKey: CryptoKey): string {
  const rsa = new NodeRSA();

  rsa.importKey(privateKey.data, privateKey.format as NodeRSA.Format);

  return rsa.encryptPrivate(data).toString("base64");
}

export function decryptPrivate(data: string, privateKey: CryptoKey): string {
  const rsa = new NodeRSA();

  rsa.importKey(privateKey.data, privateKey.format as NodeRSA.Format);

  return rsa.decrypt(data).toString("utf8");
}

export function encryptPublic(data: string, publicKey: CryptoKey): string {
  const rsa = new NodeRSA();

  rsa.importKey(publicKey.data, publicKey.format as NodeRSA.Format);

  return rsa.encrypt(data).toString("base64");
}

export function decryptPublic(data: string, publicKey: CryptoKey): string {
  const rsa = new NodeRSA();

  rsa.importKey(publicKey.data, publicKey.format as NodeRSA.Format);

  return rsa.decryptPublic(data, "utf8");
}

export function sign(data: any, privateKey: CryptoKey): string {
  const rsa = new NodeRSA();

  rsa.importKey(privateKey.data, privateKey.format as NodeRSA.Format);

  const hash = getHash(data);

  return rsa.sign(hash, "base64");
}

export function verify(
  data: any,
  signature: string,
  publicKey: CryptoKey
): boolean {
  const rsa = new NodeRSA();

  rsa.importKey(publicKey.data, publicKey.format as NodeRSA.Format);

  const hash = getHash(data);

  return rsa.verify(hash, signature, undefined, "base64");
}
