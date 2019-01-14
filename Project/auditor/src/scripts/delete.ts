/**
 * A delete script has to execute the following steps:
 *
 * 1. Execute a Delete Request:
 *  - Create a JSON object of the form
 *      {
 *          applicationUrl: "The root url the application is deployed to",
 *          configuration: {The JSON object from your configuration file}
 *      }
 *  - Send the above object as POST request JSON body to the endpoint "/delete"
 *    of your auditor server
 */

import { Configuration, isConfiguration } from "common/config/types";
import * as HttpRequest from "request";
import fs from "fs";
import { DeleteRequest } from "../requests/Delete";
import { stringify } from "common/util/funs";

/**
 * This is an example of a delete script for node.js applications.
 * @param configuration The path to the configuration file
 * @param url The root url of the application
 * @param serverUrl The (local) url of the publisher server instance
 */

type Arguments = {
  configuration: string;
  url: string;
  serverUrl: string;
};

export const deleteApplication = (args: Arguments) => {
  if (!args.configuration || !args.url || !args.serverUrl) {
    throw new Error(
      "Usage: delete --configuration [path] --url [application url] --serverUrl [server url]"
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

  HttpRequest.post(params, (error, res, body) => {
    if (error || res.statusCode >= 300) {
      throw error || new Error(body);
    }
    process.stdout.write(" Done.\n");
  });
};

//Required at the bottom for command line execution!
require("make-runnable/custom")({ printOutputFrame: false });
