import {
  TabStatus,
  ScriptExecutor,
  ResourceResolver,
  DOMSignature,
  Configuration
} from "./types";
import { getCertificateSignature, getAuditSignature, removeTags } from "./dom";
import {
  ApplicationCertificate,
  AuditionCertificate,
  Resource
} from "common/certs/types";
import { getVerifiedCertificate } from "./certificate";
import {
  validateApplicationCertificate,
  validateAuditCertificate
} from "./validation";
import { createStatus } from "./status";
import { verifyTabResources } from "./verification";
import { InvalidateCache, CertificateCache } from "./cache";
import { queryParticipant } from "./participants";
import { getHash } from "common/util/funs";
import Base64 from "base64-js";
import { evaluateAssertions } from "./assertions";

const createParticipantResolver = (configuration?: Configuration) => {
  return queryParticipant(configuration);
};

const processApplicationCertificate = async (
  tabId: number,
  url: string,
  notify: (status: TabStatus) => void,
  scriptExecutor: ScriptExecutor,
  resolveResources: ResourceResolver,
  configuration?: Configuration
) => {
  let appStatus: TabStatus;
  const queryParticipant = createParticipantResolver(configuration);

  const appCertificate = CertificateCache<ApplicationCertificate>(
    "ApplicationCertificate"
  ).get(url);

  const verify = async appCertificate => {
    notify(createStatus("ApplicationCertificate", "verifying"));

    const resourceMappings = await verifyTabResources(
      tabId,
      appCertificate,
      resolveResources
    );

    return createStatus(
      "ApplicationCertificate",
      "verified",
      appCertificate,
      resourceMappings
    );
  };

  if (appCertificate) {
    appStatus = await verify(appCertificate);
  } else {
    notify(createStatus("ApplicationCertificate", "loading"));

    const domCertSignature = await getCertificateSignature(
      tabId,
      scriptExecutor
    );

    if (!domCertSignature) {
      appStatus = createStatus("All", "complete");
    } else {
      const appCertificate = await getVerifiedCertificate<
        ApplicationCertificate
      >(url, "ApplicationCertificate", domCertSignature, queryParticipant);

      await validateApplicationCertificate(appCertificate, queryParticipant);

      appStatus = await verify(appCertificate);
    }
  }

  notify(appStatus);
  return appStatus;
};

const processAuditionCertificate = async (
  tabId: number,
  url: string,
  notify: (status: TabStatus) => void,
  scriptExecutor: ScriptExecutor,
  promiseExecutor: ScriptExecutor,
  verifiedAppStatus: TabStatus,
  loadAssertion: (id: string) => Promise<string>,
  configuration?: Configuration
) => {
  let auditStatus: TabStatus;
  const queryParticipant = createParticipantResolver(configuration);

  const auditCertificate = CertificateCache<AuditionCertificate>(
    "AuditionCertificate"
  ).get(url);

  const verify = async (auditCertificate, appCertificate) => {
    notify(
      createStatus(
        "AuditionCertificate",
        "verifying",
        undefined,
        undefined,
        verifiedAppStatus
      )
    );

    await evaluateAssertions(
      tabId,
      auditCertificate,
      notify,
      promiseExecutor,
      loadAssertion,
      verifiedAppStatus
    );

    return createStatus(
      "AuditionCertificate",
      "verified",
      auditCertificate,
      undefined,
      verifiedAppStatus
    );
  };

  if (auditCertificate) {
    const appCertificate = CertificateCache<ApplicationCertificate>(
      "ApplicationCertificate"
    ).get(url);

    auditStatus = await verify(auditCertificate, appCertificate);
  } else {
    notify(
      createStatus(
        "AuditionCertificate",
        "loading",
        undefined,
        undefined,
        verifiedAppStatus
      )
    );

    const domAuditSignature = await getAuditSignature(tabId, scriptExecutor);

    const appCertificate = CertificateCache<ApplicationCertificate>(
      "ApplicationCertificate"
    ).get(url);
    if (domAuditSignature && appCertificate) {
      const auditCertificate = await getVerifiedCertificate<
        AuditionCertificate
      >(url, "AuditionCertificate", domAuditSignature, queryParticipant);

      await validateAuditCertificate(
        auditCertificate,
        appCertificate,
        queryParticipant
      );

      auditStatus = await verify(auditCertificate, appCertificate);
    } else {
      auditStatus = createStatus(
        "AuditionCertificate",
        "complete",
        undefined,
        undefined,
        verifiedAppStatus
      );
    }
  }

  notify(auditStatus);
};

export const processTab = async (
  tabId: number,
  url: string,
  notify: (status: TabStatus) => void,
  scriptExecutor: ScriptExecutor,
  promiseExecutor: ScriptExecutor,
  loadAssertion: (id: string) => Promise<string>,
  resolveResources: ResourceResolver,
  invalidateCaches?: boolean,
  configuration?: Configuration
) => {
  try {
    if (invalidateCaches) {
      InvalidateCache(url);
    }
    const verifiedAppStatus = await processApplicationCertificate(
      tabId,
      url,
      notify,
      scriptExecutor,
      resolveResources,
      configuration
    );

    try {
      await processAuditionCertificate(
        tabId,
        url,
        notify,
        scriptExecutor,
        promiseExecutor,
        verifiedAppStatus,
        loadAssertion,
        configuration
      );
    } catch (e) {
      notify(
        createStatus(
          "AuditionCertificate",
          "error",
          e,
          undefined,
          verifiedAppStatus
        )
      );
    }
  } catch (e) {
    notify(createStatus("ApplicationCertificate", "error", e));
  }
};

export const createResource = (
  url: string,
  content: string,
  base64Encoded: boolean
): Resource => {
  const base64Encode = (str: string) => {
    const bytes = new TextEncoder().encode(str);
    return Base64.fromByteArray(bytes);
  };

  let contentString = content;

  if (
    content.includes("<x-cert-signature") ||
    content.includes("<x-audit-signature")
  ) {
    contentString = removeTags(contentString);
  }

  if (!base64Encoded) {
    contentString = base64Encode(contentString);
  }

  return { resourceUrl: url, contentHash: getHash(contentString) };
};
