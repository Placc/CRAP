import { TabStatus, Configuration } from "./client/types";
import { processTab, createResource } from "./client";
import { createStatus } from "./client/status";
import {
  parseConfiguration,
  getGlobalStatusIcon,
  loadAssertion
} from "./resources";
import { FrameResourceTree } from "./types";
import { isNil, flatten } from "lodash";
import { Resource } from "common/certs/types";
import HttpRequest from "browser-request";
import { Observable, ReplaySubject } from "rxjs";
import { resolve } from "url";
import { InvalidateCache } from "./client/cache";
import { stringify } from "common/util/funs";

const DEBUG_PROTOCOL_VERSION = "1.3";

const tabStatus = new Map<number, TabStatus>();
const tabs = new Map<number, string | undefined>();
let activeTab: number = chrome.tabs.TAB_ID_NONE;

const getResourceTree = async (tabId: number): Promise<FrameResourceTree> => {
  return new Promise<FrameResourceTree>((resolve, reject) => {
    chrome.debugger.sendCommand(
      { tabId },
      "Page.getResourceTree",
      undefined,
      (result?: any) => {
        if (!isNil(chrome.runtime.lastError) || !result) {
          reject(
            chrome.runtime.lastError || "Could not get FrameResourceTree!"
          );
        }

        const { frameTree } = result;
        resolve(frameTree);
      }
    );
  });
};

const getRemoteResource = async (url: string) => {
  return new Promise<Resource>((resolve, reject) => {
    HttpRequest.get({ url, followRedirect: false }, (err, res, body) => {
      if (err || res.statusCode >= 300) {
        reject(err || new Error(body));
      }

      resolve(createResource(url, body, false));
    });
  });
};

const getResource = async (
  tabId: number,
  frameId: string,
  url: string
): Promise<Resource> => {
  return new Promise<Resource>((resolve, reject) => {
    chrome.debugger.sendCommand(
      { tabId },
      "Page.getResourceContent",
      { frameId, url },
      (result?: any) => {
        if (!isNil(chrome.runtime.lastError) || !result) {
          console.log(`Unresolvable resource: ${url}`);

          getRemoteResource(url)
            .then(resource => resolve(resource))
            .catch(e => {
              console.log(
                chrome.runtime.lastError ||
                  `Could not get resource content! (${e.message})`
              );
              resolve({ resourceUrl: url, contentHash: "" });
            });
        } else {
          const { content, base64Encoded } = result;
          resolve(createResource(url, content, base64Encoded));
        }
      }
    );
  });
};

const getTreeResources = async (
  tabId: number,
  tree: FrameResourceTree
): Promise<Resource[]> => {
  const resources = new Array<Resource>();

  const frameContent = await getResource(tabId, tree.frame.id, tree.frame.url);
  resources.push(frameContent);

  if (tree.resources) {
    const treeResources = await Promise.all(
      tree.resources.map(
        async resource => await getResource(tabId, tree.frame.id, resource.url)
      )
    );

    resources.push(...treeResources);
  }

  if (tree.childFrames) {
    const childResources = await Promise.all(
      tree.childFrames.map(async frame => await getTreeResources(tabId, frame))
    );

    resources.push(...flatten(childResources));
  }

  return resources;
};

const detachDebugger = async (tabId: number) => {
  return new Promise(resolve =>
    chrome.debugger.detach({ tabId }, () => resolve())
  );
};

const attachDebugger = async (
  tabId: number,
  notify: (res: Resource) => void
) => {
  return new Promise((resolve, reject) => {
    const attach = () =>
      chrome.debugger.attach({ tabId }, DEBUG_PROTOCOL_VERSION, () => {
        const network = new Promise(resolve =>
          chrome.debugger.sendCommand(
            { tabId },
            "Network.enable",
            undefined,
            () => {
              attachNetworkHandler(tabId, notify);
              resolve();
            }
          )
        );

        const page = new Promise(resolve =>
          chrome.debugger.sendCommand({ tabId }, "Page.enable", undefined, () =>
            resolve()
          )
        );

        Promise.all([network, page]).then(() => resolve());
      });

    chrome.debugger.getTargets(targetInfos => {
      const info = targetInfos.find(info => info.tabId === tabId);
      if (!info) {
        reject(new Error("Couldn't get tab resource info!"));
        return;
      }
      if (info.attached) {
        detachDebugger(tabId).then(() => attach());
      } else {
        attach();
      }
    });
  });
};

const attachNetworkHandler = (
  tabId: number,
  notify: (res: Resource) => void
) => {
  const resourceTypes = [
    "Document",
    "Stylesheet",
    //"Image",  These two are possibly
    //"Media",  user-specific => ignore!
    "Font",
    "Script"
    //"Manifest"  DevTools Error: Cannot intercept resources of type 'Manifest'
  ];

  chrome.debugger.onEvent.addListener((id, method, params) => {
    if (
      id.tabId == tabId &&
      method == "Network.responseReceived" &&
      params &&
      resourceTypes.some(typ => params["type"] == typ)
    ) {
      const url = params["response"].url;
      const type = params["type"];
      const requestId = params["requestId"];

      console.log(`Got requested resource: ${url} (${type})`);

      chrome.debugger.sendCommand(
        { tabId },
        "Network.getResponseBody",
        { requestId },
        (result?: any) => {
          if (!isNil(chrome.runtime.lastError) || !result) {
            console.log(`Unresolvable resource: ${url}`);

            getRemoteResource(url)
              .then(resource => notify(resource))
              .catch(e => {
                console.error(
                  chrome.runtime.lastError ||
                    `Could not get resource content! (${e.message})`
                );
                notify({
                  resourceUrl: url,
                  contentHash: ""
                });
              });
          } else {
            const { body, base64Encoded } = result;
            notify(createResource(url, body, base64Encoded));
          }
        }
      );
    }
  });
};

export const resolveResources = async (tabId: number) => {
  const tree = await getResourceTree(tabId);
  const resources = await getTreeResources(tabId, tree);

  //await detachDebugger(tabId);

  return resources;
};

export const executeScript = (tabId: number, code: string) => {
  return new Promise<string[]>((resolve, reject) => {
    chrome.tabs.executeScript(
      tabId,
      {
        code,
        runAt: "document_end",
        matchAboutBlank: true
      },
      result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(result);
      }
    );
  });
};

export const executePromise = (tabId: number, code: string) => {
  return new Promise<string[]>((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, "Runtime.enable", undefined, () => {
      if (!isNil(chrome.runtime.lastError)) {
        console.log(
          "Couldn't execute assertion: " + stringify(chrome.runtime.lastError)
        );
        reject([chrome.runtime.lastError!.message!]);
      }

      chrome.debugger.sendCommand(
        { tabId },
        "Runtime.evaluate",
        { expression: code, awaitPromise: true },
        result => {
          if (!isNil(chrome.runtime.lastError)) {
            reject(chrome.runtime.lastError);
          } else if (result) {
            console.log("Unexpected assertion result: " + stringify(result));
            resolve([stringify(result)]);
          }
        }
      );
    });
  });
};

const invalidateStatus = (tabId: number) => {
  if (tabId != activeTab) {
    return;
  }

  const status = tabStatus.get(tabId)!;

  window.tabUrl = tabs.get(tabId) || "[unknown]";
  window.tabStatus = status;

  const icon = getGlobalStatusIcon(status);
  chrome.browserAction.setIcon({
    path: icon
  });

  const popups = chrome.extension.getViews({ type: "popup" });
  for (const popup of popups) {
    popup.location.reload(true);
  }
};

const process = (
  configuration: Configuration,
  tabId: number,
  url: string,
  notify: (status: TabStatus) => void,
  invalidate?: boolean
) => (resolve: (tabId: number) => Promise<Resource[]>) => {
  return processTab(
    tabId,
    url,
    notify,
    executeScript,
    executePromise,
    loadAssertion,
    resolve,
    invalidate,
    configuration
  ).catch(e => console.error(e.message || e.name));
};

const registerAndProcess = (
  configuration: Configuration,
  tabId?: number,
  tabUrl?: string,
  complete?: boolean,
  invalidate?: boolean
) => {
  if (isNil(tabId) || tabId == chrome.tabs.TAB_ID_NONE) {
    return;
  }

  const subject = tabStatus.get(tabId) || createStatus();
  tabStatus.set(tabId, subject);
  invalidateStatus(tabId);

  const fullUrl = tabUrl || tabs.get(tabId);

  if (complete && !isNil(fullUrl)) {
    const noqueryUrl = fullUrl.includes("?")
      ? fullUrl.slice(0, fullUrl.indexOf("?"))
      : fullUrl;
    const url = noqueryUrl.endsWith("/")
      ? noqueryUrl.slice(0, noqueryUrl.lastIndexOf("/"))
      : noqueryUrl;

    if (url.startsWith("chrome") || url.includes("about:blank")) {
      tabStatus.set(tabId, createStatus("All", "complete"));
      invalidateStatus(tabId);
    } else if (url) {
      const notify = (status: TabStatus) => {
        tabStatus.set(tabId, status);
        invalidateStatus(tabId);
      };

      const tabResources = {
        resources: new Map<string, Resource>(),
        changed: false
      };

      const processWrapped = {
        run: process(configuration, tabId, url, notify, invalidate),
        isRunning: false
      };

      const resolve = async tabId => {
        tabResources.changed = false;
        const resources = await resolveResources(tabId);
        resources.forEach(resource =>
          tabResources.resources.set(resource.resourceUrl, resource)
        );
        return [...tabResources.resources.values()];
      };

      const networkCallback = res => {
        if (
          !tabResources.resources.has(res.resourceUrl) ||
          tabResources.resources.get(res.resourceUrl)!.contentHash !=
            res.contentHash
        ) {
          tabResources.changed = true;
          tabResources.resources.set(res.resourceUrl, res);
          if (!processWrapped.isRunning) {
            processWrapped.isRunning = true;
            return processWrapped.run(resolve);
          }
        }
      };

      attachDebugger(tabId, networkCallback)
        .then(() => {
          processWrapped.isRunning = true;
          return processWrapped.run(resolve);
        })
        .then(() => {
          processWrapped.isRunning = false;
          if (tabResources.changed) {
            processWrapped.isRunning = true;
            return processWrapped.run(resolve);
          }
        });
    }
  }

  tabs.set(tabId, fullUrl);
};

parseConfiguration().then(configuration => {
  chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    for (const tab of tabs) {
      if (tab.active && tab.id) {
        activeTab = tab.id;
      }
      registerAndProcess(
        configuration,
        tab.id,
        tab.url,
        tab.status == "complete",
        true
      );
    }
  });

  chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    registerAndProcess(
      configuration,
      tab.id,
      tab.url,
      tab.status == "complete",
      true
    );
  });

  chrome.tabs.onUpdated.addListener(
    (tabId: number, info: chrome.tabs.TabChangeInfo) => {
      registerAndProcess(
        configuration,
        tabId,
        info.url,
        info.status == "complete",
        false
      );
    }
  );

  chrome.tabs.onRemoved.addListener((tabId: number) => {
    if (tabs.has(tabId)) {
      InvalidateCache(tabs.get(tabId)!);
    }
    tabStatus.delete(tabId);
    tabs.delete(tabId);
  });

  chrome.tabs.onActivated.addListener((tabInfo: chrome.tabs.TabActiveInfo) => {
    if (tabInfo.tabId != chrome.tabs.TAB_ID_NONE) {
      activeTab = tabInfo.tabId;
      invalidateStatus(tabInfo.tabId);
    }
  });
});
