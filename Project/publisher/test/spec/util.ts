import { Server, ParticipantHandler } from "common/communication/types";
import { PRIVATE_KEY, PUBLIC_KEY, queryParticipant } from "../test_data";
import { ParticipantInfo } from "common/participants/types";
import { handleLookupRequest } from "common/communication/participantHandler";
import { use, request } from "chai";
import chaiHttp from "chai-http";
import express from "express";
import proxyquire from "proxyquire";
import * as DB from "mysql";
import * as publisher from "../../src/Publisher";

export const testServer: Server = {
  privateKey: PRIVATE_KEY,
  publicKey: PUBLIC_KEY,
  staticKeys: new Map(),
  url: "publisher.url"
};

const participantHandler = (
  server: Server,
  info: ParticipantInfo
): ParticipantHandler => ({
  handleLookupRequest: handleLookupRequest(server, info),
  executeLookupRequest: queryParticipant
});

export const createPublisher = async () => {
  use(chaiHttp);

  const app = express();

  const proxy = proxyquire.noCallThru()("../../src/Publisher", {
    ...publisher,
    "common/communication/participantHandler": participantHandler
    //"./storage": testStorageService
  });

  await proxy.default(testServer, app);

  return request(app).keepOpen();
};

export const deleteAllTrees = () => {
  const db = DB.createConnection({
    host: process.env.CA_DB_HOST || "publisherdb",
    port: process.env.CA_DB_PORT || "3306",
    user: process.env.DB_USER || "development",
    password: "zaphod",
    database: process.env.DB_DATABASE || "test"
  });
  db.connect();

  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM PublisherCerts", error => {
      if (error) {
        reject(error);
      }
      db.query("DELETE FROM AppCerts", error => {
        db.end();
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
};
