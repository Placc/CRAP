import {
  MultiSignature,
  ARPKICert,
  ApplicationCertificate,
  AuditionCertificate,
  Certificate,
  Resource
} from "common/certs/types";
import { KeyPair } from "common/communication/types";

export type DOMSignature = {
  cas: string[];
  ilses: string[];
  acceptanceConfirmation: MultiSignature;
};

export type LoadingStatus =
  | "loading"
  | "verifying"
  | "complete"
  | "verified"
  | "error";

export type CertificateStatus<C extends Certificate> = {
  status: LoadingStatus;
  certificate?: ARPKICert<C>;
  error?: string;
};

export type TabStatus = {
  app: CertificateStatus<ApplicationCertificate>;
  audit: CertificateStatus<AuditionCertificate>;
  mappings?: Array<string[]>;
};

export type ScriptExecutor = (tab: number, code: string) => Promise<any[]>;

export type ResourceResolver = (tab: number) => Promise<Resource[]>;

export type CertificateCache<C extends Certificate> = {
  get: (url: string) => ARPKICert<C> | undefined;
  set: (url: string, cert: ARPKICert<C>) => void;
  invalidate: (url: string) => void;
};

export type Configuration = {
  urlMappings: Map<string, string>;
  staticKeys: Map<string, KeyPair>;
  clientKeys: KeyPair;
};
