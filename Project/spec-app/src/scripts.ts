import { spawn, execSync } from "child_process";
import { head, tail } from "lodash";

const replaceAll = function(target, search, replacement): string {
  return target.replace(new RegExp(search, "g"), replacement);
};

const NETWORK_ENV = `${process.cwd()}/src/env/network.env`;
const EVAL_ENV = `${process.cwd()}/src/env/evaluation.env`;

export const runCA = (
  url: string,
  partyDir: string,
  project: string,
  envFile: string
) => {
  console.log(`Running ${project} under ${partyDir}...`);

  const startCmd =
    'dotenv -e "%E%" docker-compose -- -p %P% -f "docker-compose.yml" up';

  const ca1Cmd = replaceAll(
    replaceAll(startCmd, "%P%", project),
    "%E%",
    envFile
  )
    .split(" ")
    .map(s => s.trim());

  const child = spawn(head(ca1Cmd)!, tail(ca1Cmd), {
    cwd: partyDir,
    stdio: "ignore",
    detached: true,
    shell: true
  });

  return new Promise<number>(resolve => {
    execSync(`sh -c "./wait-for-it.sh -t 0 ${url}"`, {
      cwd: `${process.cwd()}/../common`
    });
    resolve(child.pid);
  });
};

export const runDefault = (
  url: string,
  partyDir: string,
  evaluate?: boolean
) => {
  console.log(
    `Starting ${partyDir} using 'yarn run start'... ${
      evaluate ? "(evaluation)" : ""
    }`
  );
  const env = evaluate ? EVAL_ENV : NETWORK_ENV;

  const child = spawn("dotenv", ["-e", env, "--", "yarn", "run", "start"], {
    cwd: partyDir,
    stdio: "ignore",
    shell: true,
    detached: true
  });

  return new Promise<number>(resolve => {
    execSync(`sh -c "./wait-for-it.sh -t 0 ${url}"`, {
      cwd: `${process.cwd()}/../common`
    });
    resolve(child.pid);
  });
};

export const start = () => {
  //const monitor = runDefault("localhost:3006", `${process.cwd()}/../monitor`);

  const ils = runDefault("localhost:3003", `${process.cwd()}/../ils`, false);

  const ca1 = runCA(
    "localhost:3001",
    `${process.cwd()}/../ca`,
    "ca1",
    "../spec-app/src/env/ca1start.env"
  );
  const ca2 = runCA(
    "localhost:3002",
    `${process.cwd()}/../ca`,
    "ca2",
    "../spec-app/src/env/ca2start.env"
  );

  return Promise.all([ils, ca1, ca2]);
};

const cleanCA = (partyDir: string, project: string, resetEnvFile: string) => {
  console.log(`Cleaning ${project} under ${partyDir}...`);
  const resetCmd = `dotenv -e "%E%" sh -- "src/db/reset.sh" %P%`;

  const cmd = replaceAll(
    replaceAll(resetCmd, "%P%", project),
    "%E%",
    resetEnvFile
  )
    .split(" ")
    .map(s => s.trim());

  const childProcess = spawn(head(cmd)!, tail(cmd), {
    stdio: "pipe",
    detached: true,
    shell: true,
    cwd: partyDir
  });

  return new Promise(resolve => childProcess.on("exit", () => resolve()));
};

const cleanDefault = (partyDir: string) => {
  console.log(`Cleaning ${partyDir} using 'yarn run clean'...`);

  const childProcess = spawn(
    "dotenv",
    ["-e", NETWORK_ENV, "--", "yarn", "run", "clean"],
    {
      stdio: "pipe",
      detached: true,
      shell: true,
      cwd: partyDir
    }
  );

  return new Promise(resolve => childProcess.on("exit", () => resolve()));
};

export const copyKeyfile = (destination: string) => {
  const child = spawn(
    "copyfiles",
    ["-u", "2", "src/configurations/keyfile", `${destination}`],
    {
      stdio: "ignore",
      detached: true,
      shell: true,
      cwd: process.cwd()
    }
  );

  return new Promise(resolve => child.on("exit", () => resolve()));
};

export const setKeyFile = () => {
  Promise.all([
    copyKeyfile(`${process.cwd()}/../auditor/build`),
    copyKeyfile(`${process.cwd()}/../ils/build`),
    copyKeyfile(`${process.cwd()}/../monitor/build`),
    copyKeyfile(`${process.cwd()}/../publisher/build`)
  ]).then(() => process.exit(0));
};

export const cleanAll = (resolve?: boolean) => {
  return Promise.all([
    cleanDefault(`${process.cwd()}/../auditor`),
    cleanDefault(`${process.cwd()}/../ils`),
    cleanDefault(`${process.cwd()}/../monitor`),
    cleanDefault(`${process.cwd()}/../publisher`),
    cleanCA(
      `${process.cwd()}/../ca`,
      "ca1",
      "../spec-app/src/env/ca1reset.env"
    ),
    cleanCA(`${process.cwd()}/../ca`, "ca2", "../spec-app/src/env/ca2reset.env")
  ]).then(() => {
    if (resolve) return;
    process.exit(0);
  });
};

const buildCA = (partyDir: string, project: string, resetEnvFile: string) => {
  console.log(`Building ${project} under ${partyDir}...`);

  return copyKeyfile(`${partyDir}/build`).then(() => {
    const buildCmd =
      'yarn run compile && dotenv -e "%E%" docker-compose -- -p %P% -f "docker-compose.yml" up --build --no-start && dotenv -e "%E%" sh -- "src/db/reset.sh" %P%';

    const cmd = replaceAll(
      replaceAll(buildCmd, "%P%", project),
      "%E%",
      resetEnvFile
    )
      .split(" ")
      .map(s => s.trim());

    const childProcess = spawn(head(cmd)!, tail(cmd), {
      stdio: "pipe",
      detached: true,
      shell: true,
      cwd: partyDir
    });

    return new Promise(resolve => childProcess.on("exit", () => resolve()));
  });
};

const buildDefault = (partyDir: string) => {
  console.log(`Building ${partyDir} using 'yarn run build'...`);

  return copyKeyfile(`${partyDir}/build`).then(() => {
    const childProcess = spawn(
      "dotenv",
      ["-e", NETWORK_ENV, "--", "yarn", "run", "build"],
      {
        stdio: "pipe",
        detached: true,
        shell: true,
        cwd: partyDir
      }
    );

    return new Promise(resolve => childProcess.on("exit", () => resolve()));
  });
};

const buildCAs = () => {
  const ca1 = buildCA(
    `${process.cwd()}/../ca`,
    "ca1",
    "../spec-app/src/env/ca1reset.env"
  );
  const ca2 = buildCA(
    `${process.cwd()}/../ca`,
    "ca2",
    "../spec-app/src/env/ca2reset.env"
  );

  return Promise.all([ca1, ca2]);
};

const buildExtension = () => {
  return buildDefault(`${process.cwd()}/../extension`).then(() => {
    const copyProcess = spawn(
      "copyfiles",
      [
        "-u",
        "2",
        "src/configurations/extension.config",
        `${process.cwd()}/../extension/dist`
      ],
      {
        stdio: "ignore",
        detached: true,
        shell: true,
        cwd: process.cwd()
      }
    );

    return new Promise(resolve => copyProcess.on("exit", () => resolve()));
  });
};

export const buildOnlyExtension = () => {
  buildExtension().then(() => process.exit(0));
};

export const buildOnlyCAs = () => {
  buildCAs().then(() => process.exit(0));
};

export const buildAll = () => {
  buildDefault(`${process.cwd()}/../common`).then(async () => {
    //ILS takes way longer than the rest, so execute it besides the others
    const ils = buildDefault(`${process.cwd()}/../ils`);

    const rest = buildDefault(`${process.cwd()}/../auditor`)
      .then(() => buildDefault(`${process.cwd()}/../monitor`))
      .then(() => buildDefault(`${process.cwd()}/../publisher`))
      .then(() => buildExtension())
      .then(() => buildCAs());

    await Promise.all([ils, rest]);

    process.exit(0);
  });
};

const stopDefault = (partyDir: string) => {
  console.log(`Stopping ${partyDir}...`);

  const childProcess = spawn("docker-compose", ["stop"], {
    cwd: partyDir,
    stdio: "ignore",
    shell: true,
    detached: true
  });

  return new Promise(resolve => childProcess.on("exit", () => resolve()));
};

const stopCA = (partyDir: string, project: string) => {
  console.log(`Stopping ${partyDir}...`);

  const childProcess = spawn("docker-compose", ["-p", project, "stop"], {
    cwd: partyDir,
    stdio: "ignore",
    shell: true,
    detached: true
  });

  return new Promise(resolve => childProcess.on("exit", () => resolve()));
};

export const stopAll = async () => {
  await Promise.all([
    stopDefault(`${process.cwd()}/../auditor`),
    stopCA(`${process.cwd()}/../ca`, "ca1"),
    stopCA(`${process.cwd()}/../ca`, "ca2"),
    stopDefault(`${process.cwd()}/../ils`),
    stopDefault(`${process.cwd()}/../monitor`),
    stopDefault(`${process.cwd()}/../publisher`)
  ]).then(() => process.exit(0));
};

require("make-runnable/custom")({ printOutputFrame: false });
