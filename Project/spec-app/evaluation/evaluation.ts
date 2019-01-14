import fs from "fs";
import { start, runDefault, cleanAll, runCA } from "../src/scripts";
import { platformPath } from "../src/util";
import { execSync } from "child_process";
import { queryCertificate } from "../../extension/src/client/certificate";
import { CA, ILS } from "common/participants/types";
import proxyquire from "proxyquire";
import { AuditRequest } from "common/communication/requests/Audit";
import { CreateNonce, stringify } from "common/util/funs";
import { clone, sum, divide } from "lodash";
import * as HttpRequest from "request";
import { performance } from "perf_hooks";
import kill from "tree-kill";
import { DeployRequest } from "../../publisher/src/requests/Deploy";
import {
  loadResources,
  resolveRootHtml
} from "../../publisher/src/scripts/deploy";

const file = `${process.cwd()}/evaluation/eval_${Date.now()}.log`;

const ca1Url = "localhost:3001";
const ca2Url = "localhost:3002";
const ilsUrl = "localhost:3003";
const pubUrl = "localhost:3004";

const log = (line: string) => {
  fs.appendFileSync(file, line);
};

const startPublisher = async () => {
  const publisherDir = `${process.cwd()}/../publisher`;
  return await runDefault(pubUrl, publisherDir, true);
};

const buildWebapp = async () => {
  const webappPath = `${process.cwd()}/webapp`;
  if (!fs.existsSync(`${webappPath}/build`)) {
    execSync("yarn run build", {
      cwd: webappPath
    });
  }
};

const parseClientConfig = () => {
  const result = fs.readFileSync(
    `${process.cwd()}/src/configurations/extension.config`
  );

  const parsed = JSON.parse(result.toString().replace(/\n|\r/g, ""));

  //Revive
  parsed.urlMappings = new Map(parsed.urlMappings);
  parsed.staticKeys = new Map(parsed.staticKeys);

  return parsed;
};

const getClientParties = async () => {
  const config = parseClientConfig();

  const compiled = proxyquire.noCallThru()(
    "../../extension/src/client/participants",
    {
      "browser-request": HttpRequest
    }
  );
  const queryParticipant = compiled.queryParticipant;

  const query = queryParticipant(config);

  const ca1 = (await query(`http://${ca1Url}`)) as CA;
  const ca2 = (await query(`http://${ca2Url}`)) as CA;
  const ils = (await query(`http://${ilsUrl}`)) as ILS;

  return {
    cas: [ca1, ca2],
    ils
  };
};

const deploy = async (version: number, appUrl: string) => {
  const configurationPath = `${process.cwd()}/src/configurations/publisher.config`;
  const webappPath = platformPath(`${process.cwd()}/webapp`);
  const buildPath = platformPath(`${webappPath}/build`);
  const configContent = fs.readFileSync(configurationPath).toString("utf8");
  const configuration = JSON.parse(configContent);
  configuration.domains = [appUrl.substring(0, appUrl.lastIndexOf(":"))];

  const deployRequest: DeployRequest = {
    applicationUrl: appUrl,
    deploymentVersion: 1,
    configuration,
    resources: await loadResources(buildPath, buildPath, appUrl)
  };

  const params = {
    url: `http://${pubUrl}/deploy`,
    body: deployRequest,
    json: true
  };

  performance.mark(`publish-start ${version}`);

  await new Promise((resolve, reject) =>
    HttpRequest.post(params, error => {
      if (error) {
        reject();
      }
      resolve();
    })
  );

  performance.mark(`publish-end ${version}`);
  performance.measure(
    `${version}`,
    `publish-start ${version}`,
    `publish-end ${version}`
  );

  const measure = performance.getEntriesByName(`${version}`)[0];

  performance.clearMarks();
  performance.clearMeasures();

  return `${measure.duration}`;
};

const monitor = async (
  version: number,
  participants: { cas: CA[]; ils: ILS }
) => {
  const auditRequest: AuditRequest = {
    type: "AuditRequest",
    certType: "ApplicationCertificate",
    cas: participants.cas.map(ca => ca.url),
    ils: participants.ils.url,
    nonce: CreateNonce(),
    sinceRevision: "0"
  };

  performance.mark(`audit-start ${version}`);

  const response = await participants.cas[0].send("audit", auditRequest);

  performance.mark(`audit-end ${version}`);
  performance.measure(
    `${version}`,
    `audit-start ${version}`,
    `audit-end ${version}`
  );

  const measure = performance.getEntriesByName(`${version}`)[0];

  performance.clearMarks();
  performance.clearMeasures();

  return `${measure.duration};${Buffer.byteLength(
    stringify(response),
    "utf8"
  )}`;
};

const get = async (
  appUrl: string,
  version: number,
  participants: { cas: CA[]; ils: ILS }
) => {
  performance.mark(`client-start ${version}`);

  const response = await queryCertificate(
    "ApplicationCertificate",
    appUrl,
    participants.cas,
    participants.ils
  );
  performance.mark(`client-end ${version}`);
  performance.measure(
    `${version}`,
    `client-start ${version}`,
    `client-end ${version}`
  );

  const measure = performance.getEntriesByName(`${version}`)[0];

  performance.clearMarks();
  performance.clearMeasures();

  return `${measure.duration};${Buffer.byteLength(
    stringify(response),
    "utf8"
  )}`;
};

const deployAndGetIncremental = async () => {
  let version = 1;
  const clientParties = await getClientParties();

  log("deploy and get incremental\n\n");

  for (let count = 0; count < 100; count++) {
    try {
      const url = `http://fake0.url:${version}`;
      const p = await deploy(version, url);
      const c = await get(url, version, clientParties);
      const m = await monitor(version, clientParties);
      log(`${version};${p};${c};${m}\n`);
    } catch (e) {
      log(`\nERROR: ${e}\n`);
    }
    version++;
  }
};

const killChildren = async (children: number[]) => {
  if (!children) {
    return;
  }
  children.map(pid => kill(pid, 0));
};

const initParties = (oldProcesses: number[]) => {
  return new Promise<number[]>(async resolve => {
    await killChildren(oldProcesses);
    await cleanAll(true);
    const ils = runDefault(ilsUrl, `${process.cwd()}/../ils`, true);

    const ca1 = runCA(
      ca1Url,
      `${process.cwd()}/../ca`,
      "ca1",
      "../spec-app/src/env/ca1start.env"
    );
    const ca2 = runCA(
      ca2Url,
      `${process.cwd()}/../ca`,
      "ca2",
      "../spec-app/src/env/ca2start.env"
    );
    const children = await Promise.all([ils, ca1, ca2]);
    const publisher = await startPublisher();

    setTimeout(() => resolve(children.concat(publisher)), 5000);
  });
};

buildWebapp().then(async () => {
  fs.closeSync(fs.openSync(file, "w"));

  let childProcesses = new Array<number>();
  for (let iteration = 0; iteration < 10; iteration++) {
    childProcesses = await initParties(childProcesses);
    await deployAndGetIncremental();
  }
});
