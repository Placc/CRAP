import {
  ARPKICert,
  ApplicationCertificate,
  PublisherCertificate,
  AuditionCertificate
} from "common/certs/types";
import {
  isValidApplicationCertificate,
  isValidAuditionCertificate
} from "common/certs/validators";
import { head } from "lodash";
import { getVerifiedCertificate } from "./certificate";
import { Participant } from "common/participants/types";
import { stringify } from "common/util/funs";

export const validateApplicationCertificate = async (
  appCert: ARPKICert<ApplicationCertificate>,
  queryParticipant: (url: string) => Promise<Participant>
): Promise<void> => {
  const publisherDOM = {
    cas: appCert.publisher.cas,
    ilses: appCert.publisher.ilses,
    acceptanceConfirmation: appCert.publisher.acceptanceConfirmation
  };

  const queryPublisher = (subject: string) =>
    getVerifiedCertificate<PublisherCertificate>(
      subject,
      "PublisherCertificate",
      publisherDOM,
      queryParticipant
    );

  const isValidAppCert = isValidApplicationCertificate(
    queryPublisher,
    queryParticipant
  );

  if (!(await isValidAppCert(appCert))) {
    throw new Error("Invalid application certificate!");
  }
};

export const validateAuditCertificate = async (
  auditCert: ARPKICert<AuditionCertificate>,
  appCert: ARPKICert<ApplicationCertificate>,
  queryParticipant: (url: string) => Promise<Participant>
): Promise<void> => {
  const publisherDOM = {
    cas: auditCert.auditor.cas,
    ilses: auditCert.auditor.ilses,
    acceptanceConfirmation: auditCert.auditor.acceptanceConfirmation
  };

  const queryPublisher = (subject: string) =>
    getVerifiedCertificate<PublisherCertificate>(
      subject,
      "PublisherCertificate",
      publisherDOM,
      queryParticipant
    );

  const queryThisApp = async (url: string) => {
    if (appCert.applicationUrl == url) {
      return appCert;
    }
    throw new Error("Invalid url in audition certificate!");
  };

  const isValidAuditCert = isValidAuditionCertificate(
    queryThisApp,
    queryPublisher,
    queryParticipant
  );

  if (!(await isValidAuditCert(auditCert))) {
    throw new Error("Invalid audition certificate!");
  }
};
