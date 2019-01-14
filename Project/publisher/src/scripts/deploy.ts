/**
 * Before deployment, you have to create a publisher configuration file:
 *  - Create a file containing a JSON object of the form:
 *      {
 *          defaultCertLifetime: seconds of validity of a cert after creation,
 *          subjectName: "Your global visible publisher name",
 *          trustedCAs: [An array of urls of the CAs you want to involve],
 *          trustedILSes: [An array of urls of the ILSes you want to involve],
 *          minimumCAs: The number of CAs that must validate your certificates,
 *          domains: [An array of domain names you own]
 *      }
 *  - Note that: The length of trustedCAs and the value of minimumCAs has to be
 *               at least 2 and trustedILSes must not be empty!
 *
 * If you want to have an audition certificate created for an application,
 * you have to contact a registered Auditor. Once the app has been audited,
 * you can deploy it with the deploy script. If deployed before, the audition
 * certificate signature has to be included in the root html document by hand!
 *
 * A deploy script has to execute the following steps:
 *
 * 1. Create an array of Resource objects:
 *  - Hash all your resource files with SHA-256 and create
 *    JSON objects of the form { resourceUrl, contentHash }
 *    (The resourceUrl must be the static url the browser fetches from)
 *
 * 2. Execute a DeployRequest:
 *  - Create a JSON object of the form
 *      {
 *          applicationUrl: "The root url your application is deployed to",
 *          deploymentVersion: "The version identifier of the application",
 *          resources: [The Resource array created in step 1],
 *          forceRecreate?: "true" if you want to create a new Publisher Certificate,
 *          configuration: {The JSON object from your configuration file}
 *      }
 *  - Send the above object as POST request JSON body to the endpoint "/deploy"
 *    of your publisher server (which is deployed on your deployment server)
 *
 * 3. If successful, the request returns an acceptance confirmation object
 *    of type MultiSignature { data?: MultiSignature; signature: string; };
 *    insert this signature at the beginning of your root HTML file as a
 *    x-cert-signature element:
 *      "<x-cert-signature
 *          cas="The comma-separated list of your trusted CAs"
 *          ilses="The comma-separated list of your trusted ILSes">
 *              {The MultiSignature object of the response}
 *       </x-cert-signature>"
 *
 * 4. If the application has been audited, query the auditor for the audit signature
 *    and insert it in your root HTML file below the x-cert-signature created in step 4
 *    using a x-audit-signature element:
 *      "<x-audit-signature
 *          cas="The comma-separated list of cas returned in the query response"
 *          ilses="The comma-separated list of ilses returned in the query response">
 *              {The MultiSignature acceptanceConfirmation returned in the query response}
 *       </x-audit-signature>"
 */

import {
  PublisherConfiguration,
  isPublisherConfiguration
} from "../config/types";
import { Resource } from "common/certs/types";
import { GetSignatureRequest } from "common/communication/requests/GetSignature";
import { getHash, stringify, CreateNonce } from "common/util/funs";
import { isNil, isEmpty, head } from "lodash";
import { DeployRequest } from "../requests/Deploy";
import * as HttpRequest from "request";
import fs from "fs";
import Path from "path";
import { createAuditTag } from "./audit";
import cheerio from "cheerio";

/**
 * This is an example of a deploy script for node.js applications.
 * @param configuration The path to the configuration file
 * @param url The root url of the application
 * @param version The deployment version of the application
 * @param resources The path to your application resource files
 * @param serverUrl The (local) url of the publisher server instance
 * @param externals Optional comma separated list of external resource urls
 * @param baseUrl Optional baseUrl used for resources instead of application url
 * @param rootHtml Optional rootHtml file path; if not set, index.html at $resources is used
 * @param auditor Optional url of an auditor who has registered an audition certificate for this app
 * @param force Optional boolean; if true, the server will create a new publisher certificate
 */

type Arguments = {
  configuration: string;
  url: string;
  version: string;
  resources: string;
  serverUrl: string;
  externals?: string;
  baseUrl?: string;
  rootHtml?: string;
  auditor?: string;
  force?: string;
};

export const loadResources = async (
  path: string,
  root: string,
  baseUrl: string,
  externals?: string
): Promise<Resource[]> => {
  const resources = new Array<Resource>();

  const files = fs.readdirSync(path);
  for (const file of files) {
    const filePath = Path.resolve(path, file);
    if (fs.statSync(filePath).isDirectory()) {
      const dirResources = await loadResources(filePath, root, baseUrl);
      resources.push(...dirResources);
      continue;
    }

    let content = fs.readFileSync(filePath, "base64");

    //React-scripts DOCTYPE lowercase fix
    const utf8Content = Buffer.from(content, "base64").toString("utf8");
    if (utf8Content.includes("doctype")) {
      content = Buffer.from(
        utf8Content.replace(/doctype/g, "DOCTYPE")
      ).toString("base64");
    }

    const hash = getHash(content);

    let unixPath = filePath.replace(root, baseUrl);
    if (process.platform === "win32") {
      unixPath = unixPath.replace(/[\/|\\]/g, "/");
    }

    resources.push({
      resourceUrl: unixPath,
      contentHash: hash
    });
  }

  const externalResources = await loadExternals(externals);

  return externalResources.concat(resources);
};

const loadExternals = async (externals?: string) => {
  if (!externals || isEmpty(externals)) {
    return [];
  }
  const urls = externals.split(",");
  const result = new Array<Resource>();

  for (const url of urls) {
    const hash = await new Promise<string>((resolve, reject) =>
      HttpRequest.get({ url, encoding: "base64" }, (error, res, body) => {
        if (error || res.statusCode >= 300) {
          reject(error || new Error(body));
        }

        const hash = getHash(body);
        resolve(hash);
      })
    );

    result.push({ resourceUrl: url, contentHash: hash });
  }

  return result;
};

export const resolveRootHtml = (path: string) => {
  const htmlFiles = fs.readdirSync(path).filter(file => file.endsWith(".html"));

  if (htmlFiles.length < 1) {
    throw new Error(`No HTML files under ${path}!`);
  } else if (htmlFiles.length > 1) {
    const indexFile = htmlFiles.find(file => file.startsWith("index"));
    if (!indexFile) {
      throw new Error(
        `Multiple HTML files under ${path}, none of them called index.html!`
      );
    }
    return Path.resolve(path, indexFile);
  } else {
    return Path.resolve(path, htmlFiles[0]);
  }
};

export const deploy = (args: Arguments) => {
  if (
    !args.configuration ||
    !args.url ||
    !args.version ||
    !args.resources ||
    !args.serverUrl
  ) {
    throw new Error(
      "Usage: deploy --configuration [path] --url [application url] --version [deployment version] --resources [path] --serverUrl [server url] [--externals [comma-separated list of external resource urls]] [--baseUrl [base url used for resources]] [--rootHtml [path]] [--auditor [url]] [--force true]"
    );
  }

  //Step 0: Read configuration
  process.stdout.write("Reading configuration...");
  const configContent = fs.readFileSync(args.configuration).toString("utf8");
  const configuration = JSON.parse(configContent) as PublisherConfiguration;
  if (!isPublisherConfiguration(configuration)) {
    throw new Error("Invalid publisher configuration!");
  }
  process.stdout.write(" Done.\n");

  //Step 1: Create Resource array
  process.stdout.write("Creating resource hashes...");
  loadResources(
    args.resources,
    args.resources,
    args.baseUrl || args.url,
    args.externals
  ).then(resources => {
    process.stdout.write(" Done.\n");

    //Step 2: Execute DeployRequest
    process.stdout.write("Sending deploy request...");
    const force = args.force == "true";
    const deployRequest: DeployRequest = {
      applicationUrl: args.url,
      deploymentVersion: parseInt(args.version),
      forceRecreate: force,
      configuration,
      resources
    };

    const params = {
      url: `${args.serverUrl}/deploy`,
      body: deployRequest,
      json: true
    };

    HttpRequest.post(params, (error, res, body) => {
      if (error || res.statusCode != 200) {
        throw error || new Error(body);
      }
      process.stdout.write(" Done.\n");

      //Step 4: Insert the response body in the root html
      process.stdout.write("Inserting certificate signature in root html...");
      const rootHtml = args.rootHtml || resolveRootHtml(args.resources);
      const content = fs.readFileSync(rootHtml).toString("utf8");
      const $ = cheerio.load(content);

      $("head").append(
        `<x-cert-signature cas="${configuration.trustedCAs.join()}" ilses="${
          configuration.trustedILSes
        }" hidden>${stringify(body)}</x-cert-signature>`
      );

      fs.writeFileSync(rootHtml, $.html());

      process.stdout.write(" Done.\n");

      //Step 5: Include audit signature if existent
      if (args.auditor) {
        createAuditTag({
          auditor: args.auditor,
          url: args.url,
          version: args.version,
          rootHtml
        });
      }
    });
  });
};

//Required at the bottom for command line execution!
require("make-runnable/custom")({ printOutputFrame: false });
