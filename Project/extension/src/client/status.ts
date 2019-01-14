import { TabStatus, LoadingStatus } from "./types";
import {
  CertificateType,
  ARPKICert,
  ApplicationCertificate,
  AuditionCertificate
} from "common/certs/types";
import { isARPKICert } from "common/certs/guards";
import { cloneDeep } from "lodash";

export const createStatus = (
  certType?: CertificateType | "All",
  status?: LoadingStatus,
  data?: any,
  mappings?: Array<string[]> | undefined,
  oldStatus?: TabStatus | undefined
): TabStatus => {
  const tabStatus: TabStatus = cloneDeep(oldStatus) || {
    app: {
      status: "loading"
    },
    audit: {
      status: "loading"
    }
  };

  tabStatus.mappings = mappings || tabStatus.mappings;

  if (certType == "All" || certType == "ApplicationCertificate") {
    if (status) {
      tabStatus.app.status = status;
    }
    if (status == "error" && data) {
      tabStatus.app.error = `${data.name || "Error"}: ${data.message ||
        "[No description provided]"} (${data.stack})`;
      tabStatus.audit.status = "complete";
    }
    if (data && isARPKICert(data)) {
      tabStatus.app.certificate = data as ARPKICert<ApplicationCertificate>;
    }
  }
  if (certType == "All" || certType == "AuditionCertificate") {
    if (status) {
      tabStatus.audit.status = status;
    }
    if (status == "error" && data) {
      tabStatus.audit.error = `${data.name || "Error"}: ${data.message ||
        "[No description provided]"}`;
    }
    if (data && isARPKICert(data)) {
      tabStatus.audit.certificate = data as ARPKICert<AuditionCertificate>;
    }
  }

  return tabStatus;
};
