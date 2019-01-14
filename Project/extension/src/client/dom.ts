import { DOMSignature, ScriptExecutor } from "./types";
import { head, isEmpty } from "lodash";
import { isMultiSignature } from "common/certs/guards";
import cheerio from "cheerio";

const getXSignature = async (
  tabId: number,
  type: "cert" | "audit",
  executeDOMScript: ScriptExecutor
): Promise<DOMSignature | undefined> => {
  const result = await executeDOMScript(
    tabId,
    `Array.from(document.getElementsByTagName('x-${type}-signature')).map(node => node.outerHTML)`
  );

  if (!result || result.length == 0 || isEmpty(head(result))) {
    return;
  } else if (result.length > 1) {
    console.warn(`Got more than on x-${type}-signature tag...`);
  }

  const nodeArray = head(result) as string[];

  const $ = cheerio.load(head(nodeArray)!);
  const node = $(`x-${type}-signature`);

  if (!node) {
    throw new Error(`Invalid x-${type} signature!`);
  }

  const cas = node.attr("cas")!;
  const ilses = node.attr("ilses")!;
  const signature = node.text()!;

  if (!cas) {
    throw new Error(`Got x-${type}-signature, but cas attribute is missing!`);
  } else if (!ilses) {
    throw new Error(`Got x-${type}-signature, but ilses attribute is missing!`);
  } else {
    const acceptanceConfirmation = JSON.parse(signature);
    if (!isMultiSignature(acceptanceConfirmation)) {
      throw new Error("DOM signature is not a MultiSignature!");
    }

    return {
      cas: cas.split(",").map(ca => ca.trim()),
      ilses: ilses.split(",").map(i => i.trim()),
      acceptanceConfirmation
    };
  }
};

export const getCertificateSignature = async (
  tabId: number,
  executor: ScriptExecutor
) => {
  return await getXSignature(tabId, "cert", executor);
};

export const getAuditSignature = async (
  tabId: number,
  executor: ScriptExecutor
) => {
  return await getXSignature(tabId, "audit", executor);
};

export const removeTags = (content: string) => {
  const $ = cheerio.load(content);
  $("x-cert-signature").remove();
  $("x-audit-signature").remove();
  return $.html();
};
