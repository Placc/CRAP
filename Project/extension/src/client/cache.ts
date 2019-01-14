import {
  ARPKICert,
  AuditionCertificate,
  ApplicationCertificate,
  CertificateType,
  PublisherCertificate,
  Certificate
} from "common/certs/types";
import { CertificateCache as CertificateCacheType } from "./types";

const appCertificates = new Map<string, ARPKICert<ApplicationCertificate>>();
const auditCertificates = new Map<string, ARPKICert<AuditionCertificate>>();
const publisherCertificates = new Map<
  string,
  ARPKICert<PublisherCertificate>
>();

const AppCertificateCache: CertificateCacheType<ApplicationCertificate> = {
  get: (url: string) => appCertificates.get(url),
  set: (url: string, cert: ARPKICert<ApplicationCertificate>) =>
    appCertificates.set(url, cert),
  invalidate: (url: string) => appCertificates.delete(url)
};

const AuditCertificateCache: CertificateCacheType<AuditionCertificate> = {
  get: (url: string) => auditCertificates.get(url),
  set: (url: string, cert: ARPKICert<AuditionCertificate>) =>
    auditCertificates.set(url, cert),
  invalidate: (url: string) => auditCertificates.delete(url)
};

const PublisherCertificateCache: CertificateCacheType<PublisherCertificate> = {
  get: (url: string) => publisherCertificates.get(url),
  set: (url: string, cert: ARPKICert<PublisherCertificate>) =>
    publisherCertificates.set(url, cert),
  invalidate: (url: string) => publisherCertificates.delete(url)
};

export const CertificateCache = <C extends Certificate>(
  type: CertificateType
): CertificateCacheType<C> => {
  switch (type) {
    case "ApplicationCertificate":
      return AppCertificateCache as CertificateCacheType<any>;
    case "AuditionCertificate":
      return AuditCertificateCache as CertificateCacheType<any>;
    case "PublisherCertificate":
      return PublisherCertificateCache as CertificateCacheType<any>;
  }
};

export const InvalidateCache = (url: string) => {
  AppCertificateCache.invalidate(url);
  AuditCertificateCache.invalidate(url);
  PublisherCertificateCache.invalidate(url);
};
