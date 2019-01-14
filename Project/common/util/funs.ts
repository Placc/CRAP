import { createHash, randomBytes } from "crypto";
import stringifyStable from "fast-json-stable-stringify";
import { transform, isObject, isArrayLikeObject, toArray } from "lodash";
import fs from "fs";
import { Certificate, CertificateType } from "../certs/types";
import { ModificationRequest } from "../communication/requests/Modification";
import { Operation } from "../trillian/entry/entry_pb";
import { ContentType, TreeInfo, TreeType } from "../participants/types";
import { KeyPair } from "../communication/types";

export const getHash = (obj: any): string => {
  const str = typeof obj === "string" ? obj : stringify(obj);
  return createHash("sha256")
    .update(str)
    .digest("base64");
};

export const stringify = (obj: any): string => {
  const encodeBufferLike = elem => {
    const result = transform(
      elem,
      (res, val, key) => {
        if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
          res[key] = Buffer.from(val as Uint8Array).toString("base64");
        } else if (val instanceof ArrayBuffer) {
          res[key] = Buffer.from(val as ArrayBuffer).toString("base64");
        } else if (isArrayLikeObject(val)) {
          res[key] = toArray(val);
        } else if (isObject(val)) {
          res[key] = encodeBufferLike(val);
        } else {
          res[key] = val;
        }

        return res;
      },
      {}
    );
    return result;
  };

  return stringifyStable(encodeBufferLike({ obj }).obj) || "";
};

export const getCertDomain = (cert: Certificate) => {
  switch (cert.type) {
    case "ApplicationCertificate":
      return cert.applicationUrl;
    case "AuditionCertificate":
      return cert.application;
    case "PublisherCertificate":
      return cert.subject;
  }
};

export const getRequestOperation = (
  request: ModificationRequest<Certificate>
) => {
  switch (request.type) {
    case "DeleteRequest":
      return Operation.DELETE;
    case "RegistrationRequest":
      return Operation.CREATE;
    case "UpdateRequest":
      return Operation.UPDATE;
    default:
      throw new Error("Not a modification request!");
  }
};

export const getCertContentType = (certType: CertificateType) => {
  switch (certType) {
    case "ApplicationCertificate":
      return ContentType.APPLICATION_CERTIFICATE;
    case "AuditionCertificate":
      return ContentType.AUDIT_CERTIFICATE;
    case "PublisherCertificate":
      return ContentType.PUBLISHER_CERTIFICATE;
  }
};

export const getTreeIdForCertType = (
  trees: TreeInfo[],
  type: CertificateType,
  treeType: TreeType
) => {
  const tree = trees.find(
    tree =>
      tree.TreeType == treeType && tree.ContentType == getCertContentType(type)
  );

  return tree ? tree.TreeId : undefined;
};

export const getTreeIdForCert = (
  trees: TreeInfo[],
  cert: Certificate,
  treeType: TreeType
) => {
  return getTreeIdForCertType(trees, cert.type, treeType);
};

export const CreateNonce = () => Number.parseInt(randomBytes(64).join(""));

export const ResolveKeyFile = (
  path?: string
): Map<string, KeyPair> | undefined => {
  if (path && fs.existsSync(path)) {
    const keyFile = fs.readFileSync(path, "utf8");
    const content = JSON.parse(keyFile.replace(/\r|\n/g, ""));
    const result = new Map<string, KeyPair>(content);

    console.error(`==================KEYFILE====================`);
    console.error([...result.entries()].join("\n"));
    console.error(`=============================================`);

    return result;
  }
  return undefined;
};
