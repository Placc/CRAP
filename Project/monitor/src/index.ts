import express from "express";
import http from "http";
import { updateIlsRoots } from "./Monitor";
import { queryParticipant } from "./queryParticipant";
import { TreeRootDatabase } from "./db";
import { CertificateType } from "common/certs/types";
import { ResolveKeyFile, stringify } from "common/util/funs";
import { testPublicKey, testPrivateKey } from "./test_keys";

const keyFile = ResolveKeyFile(process.env.KEYFILE);

const port = process.env.PORT || 3006;

const storage = new TreeRootDatabase();
const app = express();

const monitorKeys = {
  public: testPublicKey,
  private: testPrivateKey
};

app.get("/", (req, res) => {
  if (!req.query.ils || !req.query.cas || !req.query.types) {
    res.writeHead(400);
    res.write(
      "Required query parameters:\n\tils: [url of ils to monitor]\n\tcas: [comma-separated list of ca urls]\n\ttypes: [Optional comma-separated list of certificate types]\n\trevision: [Optional revision to audit from]"
    );
    res.end();
    return;
  }

  const ilsUrl = unescape(req.query.ils);
  const revision = req.query.revision
    ? unescape(req.query.revision)
    : undefined;
  const cas = unescape(req.query.cas).split(",");
  const certTypes = unescape(req.query.types).split(",") as CertificateType[];

  updateIlsRoots(
    ilsUrl,
    queryParticipant(keyFile, monitorKeys),
    storage,
    cas,
    certTypes,
    revision
  )
    .then(responses => {
      res.writeHead(200);
      res.write(stringify(responses));
      res.end();
    })
    .catch(e => {
      res.writeHead(500);
      res.write(`${e.message} (${e.stack})`);
      res.end();
    });
});

const server = http.createServer(app);
server.setTimeout(60 * 60 * 1000);
server.timeout = 60 * 60 * 1000;
server.listen(port);
