import express from "express";
import log from "loglevel";
import launch from "./IntegrityLogServer";
import { Server } from "common/communication/types";
import { ResolveKeyFile } from "common/util/funs";
import { testPrivateKey, testPublicKey } from "./test_keys";
import { createServer } from "http";

const port = process.env.PORT || 3003;
const host = process.env.ILS_SERVER || "ils";
const url = `http://${host}:${port}`;

const keyFile = ResolveKeyFile(process.env.KEYFILE);

let keys = { public: testPublicKey, private: testPrivateKey };
keys = keyFile ? keyFile.get(url) || keys : keys;

const serverArgs: Server = {
  privateKey: keys.private,
  publicKey: keys.public,
  staticKeys: keyFile || new Map(),
  url
};

const logLevel = process.env.LOG_LEVEL || log.levels.WARN;
log.setLevel(logLevel as log.LogLevelDesc);

log.error(
  "============= KEYFILE: " + JSON.stringify(keyFile) + " =============="
);

const app = express();
const server = createServer(app);
server.setTimeout(60 * 60 * 1000);
server.timeout = 60 * 60 * 1000;

launch(serverArgs, app).then(() => server.listen(port));
