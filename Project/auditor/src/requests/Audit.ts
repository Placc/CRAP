import {
  Resource,
  RegisteredCert,
  ARPKICert,
  PublisherCertificate,
  MultiSignature,
  AuditionCertificate,
  AuditProperty
} from "common/certs/types";
import { Configuration, isConfiguration } from "common/config/types";
import { head, isNil } from "lodash";
import { isArrayOf, isString, isNumber } from "common/util/guards";
import {
  isResource,
  isAuditProperty,
  isAuditionCertificate
} from "common/certs/guards";
import { isAssertion } from "common/assertions/guards";
import { Assertion } from "common/assertions/types";
import { CertDatabase } from "../db";
import {
  generateCertificate,
  modifyCertificate
} from "common/communication/operations";
import { Participant, CA, ILS } from "common/participants/types";
import { Server } from "common/communication/types";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";
import { configuration } from "../../test/test_data";

export type AuditRequest = {
  applicationUrl: string;
  deploymentVersion: number;
  resources: Resource[];
  properties: AuditProperty[];
  methods?: string[];
  forceRecreate?: boolean;
  configuration: Configuration;
};

export const isAuditRequest = (obj: any): obj is AuditRequest => {
  return (
    !isNil(obj) &&
    isString(obj.applicationUrl) &&
    isNumber(obj.deploymentVersion) &&
    isArrayOf<Resource>(obj.resources, isResource) &&
    isArrayOf<AuditProperty>(obj.properties, isAuditProperty) &&
    (isNil(obj.methods) || isArrayOf<string>(obj.methods, isString)) &&
    (isNil(obj.forceRecreate) ||
      obj.forceRecreate == true ||
      obj.forceRecreate == false) /*TODO better check*/ &&
    isConfiguration(obj.configuration)
  );
};

const createPublisherCertificate = async (
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase,
  auditorInfo: Configuration
): Promise<RegisteredCert<PublisherCertificate>> => {
  const now = Date.now();
  const latestVersion = await storage.latestVersion();

  const toBeSigned: Partial<ARPKICert<PublisherCertificate>> = {
    type: "PublisherCertificate",
    caMin: auditorInfo.minimumCAs,
    cas: auditorInfo.trustedCAs,
    ilses: auditorInfo.trustedILSes,
    subject: auditorInfo.subjectName,
    domains: [],
    subjectPublicKey: publicKey,
    validity: {
      notBefore: now,
      notAfter: now + auditorInfo.defaultCertLifetime
    },
    expectedLifetime: configuration.expectedLifetime,
    version: latestVersion + 1
  };

  const signers = (await Promise.all(
    auditorInfo.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const publisherCert = await generateCertificate(
    signers,
    toBeSigned,
    privateKey
  );

  const ilses = (await Promise.all(
    auditorInfo.trustedILSes.map(async ils => await queryParticipant(ils))
  )) as ILS[];

  let registeredCert: RegisteredCert<PublisherCertificate>;
  if (latestVersion > 0) {
    registeredCert = await modifyCertificate(
      "update",
      signers,
      ilses,
      publisherCert,
      privateKey
    );
  } else {
    registeredCert = await modifyCertificate(
      "register",
      signers,
      ilses,
      publisherCert,
      privateKey
    );
  }

  await storage.setPublisherCert(registeredCert);

  return registeredCert;
};

export const processAuditRequest = (
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase
) => async (request: AuditRequest): Promise<void> => {
  let publisherCertificate = await storage.getPublisherCert();
  if (!publisherCertificate || request.forceRecreate) {
    publisherCertificate = await createPublisherCertificate(
      publicKey,
      privateKey,
      queryParticipant,
      storage,
      request.configuration
    );
  }

  const now = Date.now();

  const toBeSigned: Partial<ARPKICert<AuditionCertificate>> = {
    type: "AuditionCertificate",
    caMin: request.configuration.minimumCAs,
    cas: request.configuration.trustedCAs,
    ilses: request.configuration.trustedILSes,
    application: request.applicationUrl,
    applicationVersion: request.deploymentVersion,
    auditor: publisherCertificate,
    methods: request.methods,
    properties: request.properties,
    resources: request.resources,
    validity: {
      notBefore: now,
      notAfter: now + request.configuration.defaultCertLifetime * 1000
    }
  };
  const auditionCert: Partial<ARPKICert<AuditionCertificate>> = {
    ...toBeSigned,
    signature: sign(toBeSigned, privateKey)
  };

  const signers = (await Promise.all(
    request.configuration.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const arpkiCert = await generateCertificate(
    signers,
    auditionCert,
    privateKey
  );

  const ilses = (await Promise.all(
    request.configuration.trustedILSes.map(
      async ils => await queryParticipant(ils)
    )
  )) as ILS[];

  let registeredCert: RegisteredCert<AuditionCertificate>;
  if (await storage.exists(request.applicationUrl)) {
    registeredCert = await modifyCertificate(
      "update",
      signers,
      ilses,
      arpkiCert,
      privateKey
    );
  } else {
    registeredCert = await modifyCertificate(
      "register",
      signers,
      ilses,
      arpkiCert,
      privateKey
    );
  }

  await storage.setAuditionCert(request.applicationUrl, registeredCert);
};
