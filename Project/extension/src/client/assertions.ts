import { AuditionCertificate } from "common/certs/types";
import { TabStatus, ScriptExecutor } from "./types";
import { isEmpty } from "lodash";
import { stringify } from "common/util/funs";
import { createStatus } from "./status";

export const evaluateAssertions = async (
  tabId: number,
  cert: AuditionCertificate,
  notify: (status: TabStatus) => void,
  scriptExecutor: ScriptExecutor,
  loadAssertion: (id: string) => Promise<string>,
  verifiedAppStatus: TabStatus
) => {
  for (const property of cert.properties) {
    if (property.assertions && !isEmpty(property.assertions)) {
      for (const assertion of property.assertions) {
        const code = await loadAssertion(assertion.assertionIdentifier);

        scriptExecutor(tabId, code)
          .then(e =>
            notify(
              createStatus(
                "AuditionCertificate",
                "error",
                new Error(
                  `Assertion violation during execution: Assertion ${
                    assertion.assertionName
                  } in property "${property.property}: ${property.description}"`
                ),
                undefined,
                verifiedAppStatus
              )
            )
          )
          .catch(result => console.log(stringify(result)));
      }
    }
  }
};
