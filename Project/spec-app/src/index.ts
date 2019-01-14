import { spawn, execSync } from "child_process";
import kill from "tree-kill";
import { start } from "./scripts";

(async () => {
  await start();

  const publisher = `${process.cwd()}/src/publisher.ts`;

  const publisherProcess = spawn("ts-node", [publisher], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: true,
    shell: true
  });

  const killAll = () => {
    kill(process.pid, 0);
  };

  publisherProcess.on("exit", killAll);
  process.on("SIGINT", killAll); // catch ctrl-c
  process.on("SIGTERM", killAll); // catch kill
})();
