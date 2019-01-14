import {
  Server,
  ParticipantHandler,
  Request,
  Response
} from "common/communication/types";
import {
  PRIVATE_KEY,
  PUBLIC_KEY,
  queryParticipant,
  ils1,
  send
} from "../test_data";
import {
  ParticipantInfo,
  ILS,
  Participant,
  CA
} from "common/participants/types";
import { handleLookupRequest } from "common/communication/participantHandler";
import { use, request } from "chai";
import chaiHttp from "chai-http";
import express from "express";
import proxyquire from "proxyquire";
import * as DB from "mysql";
import * as ca from "../../src/CertificateAuthority";
import { createMessage } from "common/communication/message";

export const testServer: Server = {
  privateKey: PRIVATE_KEY,
  publicKey: PUBLIC_KEY,
  staticKeys: new Map(),
  url: "ca.url"
};

const participantHandler = (ils: ILS) => (
  server: Server,
  info: ParticipantInfo
): ParticipantHandler => {
  const query = (url: string) => {
    if (url == ils.url) {
      return Promise.resolve(ils);
    }
    return queryParticipant(url);
  };
  return {
    handleLookupRequest: handleLookupRequest(server, info),
    executeLookupRequest: query
  };
};

export const createCA = async () => {
  use(chaiHttp);

  const app = express();
  const ils = ils1;

  const proxy = proxyquire.noCallThru()("../../src/CertificateAuthority", {
    ...ca,
    "common/communication/participantHandler": participantHandler(ils)
    //"./storage": testStorageService
  });

  await proxy.default(testServer, app);

  const caServer = request(app).keepOpen();

  ils.send = sendAndRespond(caServer);

  return { ca: caServer, ils };
};

export const deleteAllTrees = () => {
  const db = DB.createConnection({
    host: process.env.CA_DB_HOST || "cadb",
    port: process.env.CA_DB_PORT || "3306",
    user: process.env.DB_USER || "development",
    password: "zaphod",
    database: process.env.DB_DATABASE || "test"
  });
  db.connect();

  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM TreeRoots", error => {
      db.end();
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const sendAndRespond = (caServer: ChaiHttp.Agent) => {
  const ca = {
    ...testServer,
    type: "ca",
    send: (e, r) => Promise.reject()
  } as CA;

  return async (
    endpoint: string,
    request: Request | Response,
    requester?: Participant
  ) => {
    const res = await send(endpoint, request);

    if (res) {
      const forwards = requester ? `${requester.url}, ils.com` : "ils.com";

      await caServer
        .post("/" + endpoint)
        .type("text/plain")
        .set("X-Forwarded-For", forwards)
        .send(
          createMessage(res, ca, {
            privateKey: PRIVATE_KEY,
            publicKey: PUBLIC_KEY,
            staticKeys: new Map(),
            url: "ils.com"
          })
        );
    }
  };
};
