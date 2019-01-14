import { Certificate } from "common/certs/types";
import { CertificateStatus, TabStatus, Configuration } from "./client/types";

export const getGlobalStatusIcon = (status: TabStatus) => {
  if (status.app.status == "verified" && status.audit.status == "verified") {
    return "icons/audited.png";
  }
  if (status.app.status == "error" || status.audit.status == "error") {
    return "icons/error.png";
  }
  return getStatusIcon(status.app);
};

export const getStatusIcon = <C extends Certificate>(
  status: CertificateStatus<C>
) => {
  switch (status.status) {
    case "loading":
      return "icons/loading.png";
    case "verifying":
      return "icons/verifying.png";
    case "error":
      return "icons/error.png";
    case "complete":
      return "icons/nocert.png";
    case "verified":
      return "icons/verified.png";
  }
};

export const getStatusColor = <C extends Certificate>(
  status: CertificateStatus<C>
) => {
  switch (status.status) {
    case "loading":
    case "verifying":
    case "complete":
      return "grey";
    case "error":
      return "#c70000";
    case "verified":
      return "#3bc456";
  }
};

export const parseConfiguration = (): Promise<Configuration> => {
  return new Promise<Configuration>((resolve, reject) => {
    chrome.runtime.getPackageDirectoryEntry(function(root) {
      root.getFile(
        "extension.config",
        {},
        function(fileEntry) {
          fileEntry.file(
            function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                if (this.result != null) {
                  const parsed = JSON.parse(
                    this.result.toString().replace(/\n|\r/g, "")
                  );

                  //Revive
                  parsed.urlMappings = new Map(parsed.urlMappings);
                  parsed.staticKeys = new Map(parsed.staticKeys);

                  resolve(parsed);
                } else {
                  reject(e);
                }
              };
              reader.readAsText(file);
            },
            e => reject(e)
          );
        },
        e => reject(e)
      );
    });
  });
};

export const loadAssertion = (identifier: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    chrome.runtime.getPackageDirectoryEntry(function(root) {
      root.getFile(
        `client/assertions/${identifier}.assert`,
        {},
        function(fileEntry) {
          fileEntry.file(
            function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                if (this.result != null) {
                  const result = this.result.toString().replace(/\n|\r/g, "");
                  resolve(result);
                } else {
                  reject(e);
                }
              };
              reader.readAsText(file);
            },
            e => reject(e)
          );
        },
        e => reject(e)
      );
    });
  });
};
