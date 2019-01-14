import { TabStatus } from "./client/types";
import { getStatusColor, getStatusIcon } from "./resources";
import { cloneDeep } from "lodash";

const getBackgroundPage = (): Promise<Window> => {
  return new Promise<Window>((resolve, reject) => {
    if (chrome.runtime.lastError) {
      reject("Background can't be loaded");
    }

    chrome.runtime.getBackgroundPage(
      page => (page ? resolve(page) : reject("Background can't be loaded"))
    );
  });
};

const setGlobalStatus = (status: TabStatus): void => {
  let statusColor = getStatusColor(status.app);
  if (status.app.status == "verified" && status.audit.status == "verified") {
    statusColor = "#005700";
  }

  const globalStatus = document.getElementById("global_status");

  if (globalStatus) {
    globalStatus.innerHTML = status.app.status;
    globalStatus.style.color = statusColor;
  }
};

const setStatus = (tabUrl: string, status: TabStatus): void => {
  setGlobalStatus(status);

  const appStatus = document.getElementById("app_status");
  const auditStatus = document.getElementById("audit_status");
  const appIcon = document.getElementById("app_icon");
  const auditIcon = document.getElementById("audit_icon");
  const appInfo = document.getElementById("app_info");
  const auditInfo = document.getElementById("audit_info");

  if (appStatus && appIcon && appInfo) {
    const appStatusColor = getStatusColor(status.app);
    const appStatusIcon = getStatusIcon(status.app);
    appStatus.innerHTML = status.app.status;
    appStatus.style.color = appStatusColor;
    appIcon.setAttribute("src", chrome.extension.getURL(appStatusIcon));

    appInfo.addEventListener("click", function(event) {
      const url = `${chrome.extension.getURL(
        "detail/detail.html"
      )}?url=${tabUrl}&content=${escape(
        JSON.stringify(status.app)
      )}&mappings=${escape(JSON.stringify(status.mappings || []))}`;
      chrome.tabs.create({ active: true, url });
    });
  }
  if (auditStatus && auditIcon && auditInfo) {
    const auditStatusColor = getStatusColor(status.audit);
    const auditStatusIcon = getStatusIcon(status.audit);
    auditStatus.innerHTML = status.audit.status;
    auditStatus.style.color = auditStatusColor;
    auditIcon.setAttribute("src", chrome.extension.getURL(auditStatusIcon));

    auditInfo.addEventListener("click", function(event) {
      const url = `${chrome.extension.getURL(
        "detail/detail.html"
      )}?url=${tabUrl}&content=${escape(
        JSON.stringify(status.audit)
      )}&mappings=${escape(JSON.stringify(status.mappings || []))}`;
      chrome.tabs.create({ active: true, url });
    });
  }
};

const start = async () => {
  const background = await getBackgroundPage();

  if (background && background.tabStatus) {
    setStatus(`${background.tabUrl}`, cloneDeep(background.tabStatus));
  }
};

start();
