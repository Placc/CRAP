import { Assertion } from "../assertions/types";
import { ILS, Monitor } from "../participants/types";
import { CryptoKey } from "../crypto/types";

export interface Resource {
  resourceUrl: string;
  contentHash: string;
}

export interface Validity {
  notBefore: number;
  notAfter: number;
}

export interface AuditProperty {
  property: string;
  description: string;
  assertions?: Array<Assertion>;
}

export interface PublisherCertificate {
  type: "PublisherCertificate";
  version: number;
  domains: Array<string>;
  subject: string;
  subjectPublicKey: CryptoKey;
  validity: Validity;
  expectedLifetime: number;
}

export interface ApplicationCertificate {
  type: "ApplicationCertificate";
  deploymentVersion: number;
  applicationUrl: string;
  resources: Array<Resource>;
  publisher: RegisteredCert<PublisherCertificate>;
  signature: string;
  validity: Validity;
}

export interface AuditionCertificate {
  type: "AuditionCertificate";
  application: string;
  applicationVersion: number;
  auditor: RegisteredCert<PublisherCertificate>;
  resources: Array<Resource>;
  signature: string;
  methods: Array<string>;
  properties: Array<AuditProperty>;
  validity: Validity;
}

export type Certificate =
  | ApplicationCertificate
  | AuditionCertificate
  | PublisherCertificate;

export type CertificateType =
  | "PublisherCertificate"
  | "AuditionCertificate"
  | "ApplicationCertificate";

export type ARPKICert<C extends Certificate> = C & {
  ilses: Array<string>;
  cas: Array<string>;
  caMin: number;
  signatures: Array<string>;
};

export type MultiSignature = {
  data?: MultiSignature;
  signature: string;
};

export type RegisteredCert<C extends Certificate> = ARPKICert<C> & {
  acceptanceConfirmation: MultiSignature;
};
