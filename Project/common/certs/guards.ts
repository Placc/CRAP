import {
  ApplicationCertificate,
  Resource,
  Validity,
  PublisherCertificate,
  AuditionCertificate,
  Certificate,
  AuditProperty,
  ARPKICert,
  CertificateType,
  RegisteredCert,
  MultiSignature
} from "./types";
import { Assertion } from "../assertions/types";
import { isString, isNumber, isArrayOf } from "../util/guards";
import { isAssertion } from "../assertions/guards";
import { isILS, isMonitor } from "../participants/guards";
import { isUndefined, isNull, isArray, isNaN, isNil, isObject } from "lodash";
import { isCryptoKey } from "../crypto/guards";

export function isCertificateType(obj: any): obj is CertificateType {
  return (
    !isNil(obj) &&
    (obj == "ApplicationCertificate" ||
      obj == "AuditionCertificate" ||
      obj == "PublisherCertificate")
  );
}

export function isPublisherType(type: CertificateType): boolean {
  return type === "PublisherCertificate";
}

export function isAuditionType(type: CertificateType): boolean {
  return type === "AuditionCertificate";
}

export function isApplicationType(type: CertificateType): boolean {
  return type === "ApplicationCertificate";
}

export function isValidity(obj: any): obj is Validity {
  const validFields = ["notBefore", "notAfter"];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    isNumber(obj["notBefore"]) &&
    isNumber(obj["notAfter"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isResource(obj: any): obj is Resource {
  const validFields = ["resourceUrl", "contentHash"];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    isString(obj["resourceUrl"]) &&
    isString(obj["contentHash"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isAuditProperty(obj: any): obj is AuditProperty {
  const validFields = ["property", "description", "assertions"];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    isString(obj["property"]) &&
    isString(obj["description"]) &&
    (isUndefined(obj["assertions"]) ||
      isArrayOf<Assertion>(obj["assertions"], isAssertion)) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isARPKICert(obj: any): obj is ARPKICert<Certificate> {
  const validFields = ["ilses", "cas", "caMin", "signatures"];

  if (
    !isNil(obj) &&
    isObject(obj) &&
    isArrayOf<string>(obj["ilses"], isString) &&
    isArrayOf<string>(obj["signatures"], isString) &&
    isArrayOf<string>(obj["cas"], isString) &&
    isNumber(obj["caMin"])
  ) {
    const {
      ilses,
      cas,
      caMin,
      acceptanceConfirmation,
      signatures,
      ...rawCert
    } = obj;

    switch (rawCert.type) {
      case "PublisherCertificate":
        return isPublisherCertificate(rawCert);
      case "ApplicationCertificate":
        return isApplicationCertificate(rawCert);
      case "AuditionCertificate":
        return isAuditionCertificate(rawCert);
    }
  }

  return false;
}

export function isPublisherCertificate(obj: any): obj is PublisherCertificate {
  const validFields = [
    "version",
    "subject",
    "domains",
    "subjectPublicKey",
    "validity",
    "expectedLifetime",
    "type"
  ];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    obj["type"] === "PublisherCertificate" &&
    isNumber(obj["version"]) &&
    isNumber(obj["expectedLifetime"]) &&
    isString(obj["subject"]) &&
    isArrayOf<string>(obj["domains"], isString) &&
    isCryptoKey(obj["subjectPublicKey"]) &&
    isValidity(obj["validity"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isApplicationCertificate(
  obj: any
): obj is ApplicationCertificate {
  const validFields = [
    "deploymentVersion",
    "applicationUrl",
    "resources",
    "publisher",
    "signature",
    "validity",
    "assertions",
    "type"
  ];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    obj["type"] === "ApplicationCertificate" &&
    isNumber(obj["deploymentVersion"]) &&
    isString(obj["signature"]) &&
    isString(obj["applicationUrl"]) &&
    isArrayOf<Resource>(obj["resources"], isResource) &&
    isRegisteredCert(obj["publisher"]) &&
    isValidity(obj["validity"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isAuditionCertificate(obj: any): obj is AuditionCertificate {
  const validFields = [
    "application",
    "applicationVersion",
    "auditor",
    "resources",
    "signature",
    "methods",
    "properties",
    "validity",
    "type"
  ];
  return (
    !isNil(obj) &&
    isObject(obj) &&
    obj["type"] === "AuditionCertificate" &&
    isString(obj["signature"]) &&
    isString(obj["application"]) &&
    isNumber(obj["applicationVersion"]) &&
    isRegisteredCert(obj["auditor"]) &&
    isArrayOf<Resource>(obj["resources"], isResource) &&
    isArrayOf<string>(obj["methods"], isString) &&
    isArrayOf<AuditProperty>(obj["properties"], isAuditProperty) &&
    isValidity(obj["validity"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isRegisteredCert(obj: any): obj is RegisteredCert<Certificate> {
  if (!isNil(obj) && isObject(obj)) {
    const { acceptanceConfirmation, ...arpkiCert } = obj;

    return isMultiSignature(acceptanceConfirmation) && isARPKICert(arpkiCert);
  }

  return false;
}

export function isMultiSignature(obj: any): obj is MultiSignature {
  const validFields = ["signature", "data"];
  return (
    !isNil(obj) &&
    isString(obj["signature"]) &&
    (isMultiSignature(obj["data"]) || isNil(obj["data"])) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}
