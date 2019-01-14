import { spawn, execSync } from "child_process";
import kill from "tree-kill";
import { platformPath } from "./util";
import { includes, pull } from "lodash";
import fs from "fs";
import puppeteer from "puppeteer";
import { runDefault } from "./scripts";

const publisherDir = platformPath(`${process.cwd()}/../publisher`);
const configurationPath = platformPath(
  `${process.cwd()}/src/configurations/publisher.config`
);
const appUrl = `http://localhost:${process.env.PORT || 3000}`;
const webappPath = platformPath(`${process.cwd()}/webapp`);
const auditor = platformPath(`${process.cwd()}/src/auditor.ts`);

const versionPath = platformPath(`${webappPath}/build_version`);

const resolveBuildVersion = (path: string) => {
  let version = 1;
  if (fs.existsSync(path)) {
    const vs = fs.readFileSync(path, "utf8");
    version = parseInt(vs) + 1;
  }

  fs.writeFileSync(path, `${version}`);
  return version;
};

const buildVersion = resolveBuildVersion(versionPath);

console.log(" ________________________________________________");
console.log("|                                                |");
console.log("|                   PUBLISHER                    |");
console.log("|                   =========                    |");
console.log(" ________________________________________________\n");

console.log(
  "[Publisher] The publisher directory is located under " + publisherDir + "."
);
console.log("[Publisher] My configuration file is: " + configurationPath + ".");
console.log(
  "[Publisher] My auditor buddy is located unter " + auditor + ".\n\n"
);

console.log(
  "[Publisher] I want to publish my WebApp under ./webapp to " + appUrl + "!"
);
console.log(
  "[Publisher] At first, I have to start my local Publisher Server..."
);

runDefault("localhost:3004", publisherDir).then(() => {
  console.log("[Publisher] It's running! Now I can start the build process...");

  execSync("yarn run build", {
    cwd: webappPath
  });

  console.log(
    "[Publisher] The build completed! Let's execute the deploy script before I serve the app..."
  );

  execSync(
    `node build/src/scripts/deploy.js deploy --configuration "${configurationPath}" --url "${appUrl}" --version ${buildVersion} --resources "${platformPath(
      webappPath + "/build"
    )}" --serverUrl "http://localhost:3004" --externals "https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmSU5fBBc4.woff2"`,
    { cwd: publisherDir, stdio: "inherit" }
  );

  console.log(
    "[Publisher] Okay, I registered a new Application Certificate and included the signature in index.html. Now, I can deploy the app!"
  );

  spawn(
    "serve",
    ["-l", `${process.env.PORT || 3000}`, "-s", `${webappPath}/build`],
    {
      cwd: process.cwd(),
      stdio: "ignore",
      detached: true,
      shell: true
    }
  );

  console.log(
    "[Publisher] Done! Anyone can access my CRAPPI secured WebApp under " +
      appUrl +
      " now!"
  );

  const launchPuppeteer = async (url: string) => {
    const extensionPath =
      process.env.EXTENSION || `${process.cwd()}/../extension/dist`;

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true);
    await page.goto(url);

    browser.on("disconnected", () => {
      kill(process.pid);
    });

    return page;
  };

  const askUserOption = async () => {
    const userInput = await new Promise<string>((resolve, reject) => {
      process.stdin.resume();
      process.stdin.on("data", function(data) {
        process.stdin.pause();
        const response = data.toString().trim();
        resolve(response.toLowerCase());
      });
    });

    if (!isNaN(parseInt(userInput))) {
      const num = parseInt(userInput);
      if (num > 0 && num < 4) {
        return num;
      }
    }
    return await askUserOption();
  };

  const alterHtml = () => {
    const file = fs
      .readdirSync(`${platformPath(webappPath + "/build/static/js")}`)
      .find(name => name.startsWith("main.") && name.endsWith(".chunk.js"));
    const path = `${platformPath(webappPath + "/build/static/js/" + file)}`;
    const content = fs.readFileSync(path).toString("utf8");
    const hashIndex = content.indexOf(".getHash)");
    const tail = content.slice(hashIndex + ".getHash)".length);
    const init = content.slice(
      0,
      content.substring(0, hashIndex).lastIndexOf("Object(")
    );
    const altered = init.concat(tail);
    fs.writeFileSync(path, altered);
  };

  const showOptions = (opts, page?) => {
    console.log("[Publisher] Well, now you have the following options:");
    if (includes(opts, 1)) {
      console.log(
        "\t1) I can ask my auditor buddy to audit the app and include an Audition Certificate"
      );
    }
    if (includes(opts, 2)) {
      console.log(
        "\t2) I can alter some resources and see if CRAPPI raises an alarm"
      );
    }
    if (includes(opts, 3)) {
      console.log("\t3) I can stop the application");
    }
    console.log("[Publisher] Which option do you choose?: ");

    askUserOption().then(option => {
      if (!includes(opts, option)) {
        showOptions(opts, page);
        return;
      }

      switch (option) {
        case 1: {
          console.log(
            "[Publisher] Let's ask my Auditor buddy to audit the app..."
          );
          spawn("ts-node", [`${auditor}`], {
            cwd: process.cwd(),
            stdio: "ignore",
            detached: true,
            shell: true
          }).on("exit", () => {
            console.log(
              "[Publisher] He audited it! Now I only have to execute the audit script to include the signature..."
            );

            execSync(
              `node build/src/scripts/audit.js createAuditTag --url "${appUrl}" --version "${buildVersion}-beta" --auditor "http://localhost:3005" --rootHtml "${platformPath(
                webappPath + "/build/index.html"
              )}"`,
              { cwd: publisherDir, stdio: "inherit" }
            );

            console.log(
              "[Publisher] Cool! I included the tag, CRAPPI should mark my application as audited!"
            );

            if (!page.isClosed()) {
              page.reload();
            }
            showOptions(pull(opts, 1), page);
          });
          break;
        }
        case 2: {
          console.log("[Publisher] Let's make some changes...");

          alterHtml();
          console.log(
            "[Publisher] The app sends your password in plain-text now, hopefully CRAPPI realizes that..."
          );

          if (!page.isClosed()) {
            page.reload();
          }
          showOptions(pull(opts, 2), page);
          break;
        }
        case 3: {
          console.log("Okay then, I'm gonna kill myself in some seconds...");
          setTimeout(() => kill(process.pid, 0), 5000);
        }
      }
    });
  };

  launchPuppeteer(appUrl).then(page => showOptions([1, 2, 3], page));
});
