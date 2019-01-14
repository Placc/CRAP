/**
 * A delete script has to execute the following steps:
 *
 * 1. Execute a Delete Request:
 *  - Create a JSON object of the form
 *      {
 *          applicationUrl: "The root url your application is deployed to",
 *          configuration: {The JSON object from your configuration file}
 *      }
 *  - Send the above object as POST request JSON body to the endpoint "/delete"
 *    of your publisher server (which is deployed on your deployment server)
 *
 * 2. If successful, delete the x-cert-signature element at the beginning of
 *    your root HTML file
 */

import {
  PublisherConfiguration,
  isPublisherConfiguration
} from "../config/types";
import * as HttpRequest from "request";
import fs from "fs";
import { DeleteRequest } from "../requests/Delete";
import cheerio from "cheerio";

/**
 * This is an example of a delete script for node.js applications.
 * @param configuration The path to the configuration file
 * @param url The root url of the application
 * @param serverUrl The (local) url of the publisher server instance
 * @param rootHtml The path to the root html file of your application
 */

type Arguments = {
  configuration: string;
  url: string;
  serverUrl: string;
  rootHtml: string;
};

export const deleteApplication = (args: Arguments) => {
  if (!args.configuration || !args.url || !args.serverUrl || !args.rootHtml) {
    throw new Error(
      "Usage: delete --configuration [path] --url [application url] --serverUrl [server url] --rootHtml [path]"
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

  //Step 1: Execute DeleteRequest
  process.stdout.write("Sending delete request...");
  const deleteRequest: DeleteRequest = {
    applicationUrl: args.url,
    configuration
  };

  const params = {
    url: `${args.serverUrl}/delete`,
    body: deleteRequest,
    json: true
  };

  HttpRequest.post(params, error => {
    if (error) {
      throw error;
    }
    process.stdout.write(" Done.\n");

    //Step 2: Delete x-cert-signature tag
    process.stdout.write("Deleting certificate signature from root html...");
    const content = fs.readFileSync(args.rootHtml).toString("utf8");

    const $ = cheerio.load(content);

    $("x-cert-signature").remove();
    $("x-audit-signature").remove();

    fs.writeFileSync(args.rootHtml, $.html());
    process.stdout.write(" Done.\n");
  });
};

//Required at the bottom for command line execution!
require("make-runnable/custom")({ printOutputFrame: false });
