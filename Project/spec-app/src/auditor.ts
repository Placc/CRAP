import { spawn, execSync, execFile } from "child_process";
import fs from "fs";
import { platformPath } from "./util";
import { runDefault } from "./scripts";

const auditorDir = platformPath(`${process.cwd()}/../auditor`);
const configurationPath = platformPath(
  `${process.cwd()}/src/configurations/auditor.config`
);
const appUrl = `http://localhost:${process.env.PORT || 3000}`;
const webappPath = platformPath(`${process.cwd()}/webapp`);

const versionPath = platformPath(`${webappPath}/build_version`);

const resolveBuildVersion = (path: string) => {
  let version = 1;
  if (fs.existsSync(path)) {
    const vs = fs.readFileSync(path, "utf8");
    version = parseInt(vs);
  }

  return version;
};

const buildVersion = resolveBuildVersion(versionPath);

console.log(" ________________________________________________");
console.log("|                                                |");
console.log("|                    AUDITOR                     |");
console.log("|                   =========                    |");
console.log(" ________________________________________________\n");

console.log(
  "[Auditor] The auditor directory is located under " + auditorDir + "."
);
console.log(
  "[Auditor] My configuration file is: " + configurationPath + ".\n\n"
);

console.log(
  "[Auditor] I have audited the WebApp under ./webapp and want to register a Certificate for it!"
);
console.log("[Auditor] At first, I have to start my local Auditor Server...");

runDefault("localhost:3005", auditorDir).then(() => {
  setTimeout(() => {
    console.log("[Auditor] It's running! Let's execute the audit script...");

    execSync(
      `node build/src/scripts/audit.js audit --configuration "${configurationPath}" --url "${appUrl}" --version ${buildVersion} --resources "${platformPath(
        webappPath + "/build"
      )}" --serverUrl "http://localhost:3005"`,
      { cwd: auditorDir, stdio: "inherit" }
    );

    console.log(
      "[Auditor] Okay, I registered a new Audition Certificate. The publisher can ask me for the signature anytime!"
    );

    process.exit(0);
  }, 5000);
});
