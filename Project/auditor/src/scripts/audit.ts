/**
 * Before audition, you have to create a publisher configuration file:
 *  - Create a file containing a JSON object of the form:
 *      {
 *          defaultCertLifetime: seconds of validity of a cert after creation,
 *          subjectName: "Your global visible auditor name",
 *          trustedCAs: [An array of urls of the CAs you want to involve],
 *          trustedILSes: [An array of urls of the ILSes you want to involve],
 *          minimumCAs: The number of CAs that must validate your certificates,
 *      }
 *  - Note that: The length of trustedCAs and the value of minimumCAs has to be
 *               at least 2 and trustedILSes must not be empty!
 *
 *
 * An audit script has to execute the following steps:
 *
 * 1. Create an array of Resource objects:
 *  - Hash all the resource files you audited with SHA-256 and create
 *    JSON objects of the form { resourceUrl, contentHash }
 *    (The resourceUrl must be the static url the browser fetches from)
 *
 * 2. Create an array of AuditProperty objects:
 *  - Describe the properties the application fulfills in JSON objects of the form
 *      {
 *        property: "The name of the property",
 *        description: "A descriptive text for the property",
 *        assertions?: [Optional known assertions (under common/assertions)]
 *      }
 *
 * 3. Execute an AuditRequest:
 *  - Create a JSON object of the form
 *      {
 *          applicationUrl: "The root url the application is deployed to",
 *          deploymentVersion: "The version identifier of the application",
 *          resources: [The Resource array created in step 1],
 *          properties: [The optional Assertion array from step 2],
 *          methods?: [An optional string array describing the audit methods you used]
 *          forceRecreate?: "true" if you want to create a new Publisher Certificate,
 *          configuration: {The JSON object from your configuration file}
 *      }
 *  - Send the above object as POST request JSON body to the endpoint "/audit"
 *    of your auditor server
 */

import { Configuration, isConfiguration } from "common/config/types";
import { Resource, AuditProperty } from "common/certs/types";
import { getHash } from "common/util/funs";
import { NoEval } from "common/assertions";
import Path from "path";
import { AuditRequest } from "../requests/Audit";
import * as HttpRequest from "request";
import fs from "fs";

/**
 * This is an example of a audit script for node.js applications.
 * @param configuration The path to the configuration file
 * @param url The root url of the application
 * @param version The deployment version of the application
 * @param resources The path to your application resource files
 * @param serverUrl The (local) url of the auditor server instance
 * @param baseUrl Optional baseUrl used for resources instead of application url
 * @param force Optional boolean; if true, the server will create a new publisher certificate
 */

type Arguments = {
  configuration: string;
  url: string;
  version: string;
  resources: string;
  serverUrl: string;
  baseUrl?: string;
  force?: string;
};

const loadResources = (
  path: string,
  root: string,
  baseUrl: string
): Resource[] => {
  const resources = new Array<Resource>();

  const files = fs.readdirSync(path);
  for (const file of files) {
    const filePath = Path.resolve(path, file);
    if (fs.statSync(filePath).isDirectory()) {
      resources.push(...loadResources(filePath, root, baseUrl));
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

  return resources;
};

const loadProperties = (
  path: string,
  root: string
): { methods: string[]; properties: AuditProperty[] } => {
  //TODO load properties by dynamic/static analysis,...
  //These are just dummy-values!!!
  return {
    methods: ["code review"],
    properties: [
      {
        property: "hashed password",
        description: "the password is always hashed before sent to the server"
      },
      {
        property: "No eval calls",
        description:
          "The JavaScript function eval() that is widely considered unsecure is never called.",
        assertions: [NoEval]
      }
    ]
  };
};

export const audit = (args: Arguments) => {
  if (
    !args.configuration ||
    !args.url ||
    !args.version ||
    !args.resources ||
    !args.serverUrl
  ) {
    throw new Error(
      "Usage: audit --configuration [path] --url [application url] --version [deployment version] --resources [path] --serverUrl [server url] [--baseUrl [base url used for resources]] [--force true]"
    );
  }

  //Step 0: Read configuration
  process.stdout.write("Reading configuration...");
  const configContent = fs.readFileSync(args.configuration).toString("utf8");
  const configuration = JSON.parse(configContent) as Configuration;
  if (!isConfiguration(configuration)) {
    throw new Error("Invalid configuration!");
  }
  process.stdout.write(" Done.\n");

  //Step 1: Create Resource array
  process.stdout.write(`Creating resource hashes (${args.resources})...`);
  const resources = loadResources(
    args.resources,
    args.resources,
    args.baseUrl || args.url
  );
  process.stdout.write(" Done.\n");

  //Step 2: Create AuditProperty array
  process.stdout.write("Processing audit...");
  const { methods, properties } = loadProperties(
    args.resources,
    args.resources
  );
  process.stdout.write(" Done.\n");

  //Step 3: Execute AuditRequest
  process.stdout.write("Sending audit request...");
  const force = args.force == "true";
  const auditRequest: AuditRequest = {
    applicationUrl: args.url,
    deploymentVersion: Number.parseFloat(args.version),
    forceRecreate: force,
    configuration,
    resources,
    properties,
    methods
  };

  const params = {
    url: `${args.serverUrl}/audit`,
    body: auditRequest,
    json: true
  };

  HttpRequest.post(params, (error, res, body) => {
    if (error || res.statusCode != 204) {
      throw error || new Error(body);
    }
    process.stdout.write(" Done.\n");
  });
};

//Required at the bottom for command line execution!
require("make-runnable/custom")({ printOutputFrame: false });
