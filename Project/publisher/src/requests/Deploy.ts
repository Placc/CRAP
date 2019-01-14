import {
  Resource,
  RegisteredCert,
  ApplicationCertificate,
  ARPKICert,
  PublisherCertificate,
  MultiSignature
} from "common/certs/types";
import {
  PublisherConfiguration,
  isPublisherConfiguration
} from "../config/types";
import { head, isNil } from "lodash";
import { isArrayOf, isString, isNumber } from "common/util/guards";
import { isResource } from "common/certs/guards";
import { CertDatabase } from "../db";
import {
  generateCertificate,
  modifyCertificate
} from "common/communication/operations";
import { Participant, CA, ILS } from "common/participants/types";
import { Server } from "common/communication/types";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";

export type DeployRequest = {
  applicationUrl: string;
  deploymentVersion: number;
  resources: Resource[];
  forceRecreate?: boolean;
  configuration: PublisherConfiguration;
};

export const isDeployRequest = (obj: any): obj is DeployRequest => {
  return (
    !isNil(obj) &&
    isString(obj.applicationUrl) &&
    isNumber(obj.deploymentVersion) &&
    isArrayOf<Resource>(obj.resources, isResource) &&
    (isNil(obj.forceRecreate) ||
      obj.forceRecreate == true ||
      obj.forceRecreate == false) /*TODO better check*/ &&
    isPublisherConfiguration(obj.configuration)
  );
};

const createPublisherCertificate = async (
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase,
  publisherInfo: PublisherConfiguration
): Promise<RegisteredCert<PublisherCertificate>> => {
  const now = Date.now();
  const latestVersion = await storage.latestVersion();

  const toBeSigned: Partial<ARPKICert<PublisherCertificate>> = {
    type: "PublisherCertificate",
    caMin: publisherInfo.minimumCAs,
    cas: publisherInfo.trustedCAs,
    ilses: publisherInfo.trustedILSes,
    expectedLifetime: publisherInfo.expectedLifetime * 1000,
    subject: publisherInfo.subjectName,
    domains: publisherInfo.domains,
    subjectPublicKey: publicKey,
    validity: {
      notBefore: now,
      notAfter: now + publisherInfo.defaultCertLifetime * 1000
    },
    version: latestVersion + 1
  };

  const signers = (await Promise.all(
    publisherInfo.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const publisherCert = await generateCertificate(
    signers,
    toBeSigned,
    privateKey
  );

  const ilses = (await Promise.all(
    publisherInfo.trustedILSes.map(async ils => await queryParticipant(ils))
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

export const processDeployRequest = (
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase
) => async (request: DeployRequest): Promise<MultiSignature> => {
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

  const toBeSigned: Partial<ARPKICert<ApplicationCertificate>> = {
    type: "ApplicationCertificate",
    caMin: request.configuration.minimumCAs,
    cas: request.configuration.trustedCAs,
    ilses: request.configuration.trustedILSes,
    applicationUrl: request.applicationUrl,
    deploymentVersion: request.deploymentVersion,
    publisher: publisherCertificate,
    resources: request.resources,
    validity: {
      notBefore: now,
      notAfter: now + request.configuration.defaultCertLifetime * 1000
    }
  };
  const applicationCert: Partial<ARPKICert<ApplicationCertificate>> = {
    ...toBeSigned,
    signature: sign(toBeSigned, privateKey)
  };

  const signers = (await Promise.all(
    request.configuration.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const arpkiCert = await generateCertificate(
    signers,
    applicationCert,
    privateKey
  );

  const ilses = (await Promise.all(
    request.configuration.trustedILSes.map(
      async ils => await queryParticipant(ils)
    )
  )) as ILS[];

  let registeredCert: RegisteredCert<ApplicationCertificate>;
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

  await storage.setAppCert(request.applicationUrl, registeredCert);

  return {
    data: registeredCert.acceptanceConfirmation,
    signature: sign(registeredCert.acceptanceConfirmation, privateKey)
  };
};
