import { GetSignatureRequest } from "common/communication/requests/GetSignature";
import { CreateNonce, stringify } from "common/util/funs";
import * as HttpRequest from "request";
import fs from "fs";
import { head } from "lodash";
import cheerio from "cheerio";

/**
 * This is an extension of the deploy script which adds an audit signature to the root HTML document.
 * @param url The root url of the application
 * @param version The deployment version of the application
 * @param auditor Optional url of an auditor who has registered an audition certificate for this app
 * @param rootHtml Path to root HTML document
 */

type Arguments = {
  url: string;
  version: string;
  auditor: string;
  rootHtml: string;
};

export const createAuditTag = (args: Arguments) => {
  if (!args.url || !args.version || !args.auditor) {
    throw new Error(
      "Usage: createAuditTag --url [application url] --version [application version] --auditor [auditor url] --rootHtml [path to root HTML document]"
    );
  }

  process.stdout.write("Querying audition certificate signature...");
  const getRequest: GetSignatureRequest = {
    type: "GetSignatureRequest",
    applicationUrl: args.url,
    deploymentVersion: parseInt(args.version),
    nonce: CreateNonce()
  };

  const params = {
    url: `${args.auditor}/get`,
    body: getRequest,
    json: true
  };

  HttpRequest.post(params, (error, res, body) => {
    if (error || res.statusCode >= 300) {
      throw error || new Error(body);
    }

    process.stdout.write(" Done.\n");

    if (!body.acceptanceConfirmation || !body.cas || !body.ilses) {
      return;
    }

    process.stdout.write("Inserting certificate signature in root html...");

    const content = fs.readFileSync(args.rootHtml).toString("utf8");

    const $ = cheerio.load(content);

    $("head").append(
      `<x-audit-signature cas="${body.cas.join()}" ilses="${
        body.ilses
      }" hidden>${stringify(body.acceptanceConfirmation)}</x-audit-signature>`
    );

    fs.writeFileSync(args.rootHtml, $.html());

    process.stdout.write(" Done.\n");
  });
};

//Required at the bottom for command line execution!
require("make-runnable/custom")({ printOutputFrame: false });
