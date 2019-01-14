import { ParticipantHandler, Server } from "common/communication/types";
import { use, request } from "chai";
import { stub, createStubInstance } from "sinon";
import { ParticipantInfo } from "common/participants/types";
import { queryParticipant, PRIVATE_KEY, PUBLIC_KEY } from "../test_data";
import { handleLookupRequest } from "common/communication/participantHandler";
import * as ils from "../../src/IntegrityLogServer";
import express from "express";
import chaiHttp from "chai-http";
import proxyquire from "proxyquire";
import { testApplicationStorage, testAuditionStorage } from "../storage/util";
import { StorageService } from "../../src/storage";

export const testServer: Server = {
  privateKey: PRIVATE_KEY,
  publicKey: PUBLIC_KEY,
  staticKeys: new Map(),
  url: "ils.com"
};

const participantHandler = (
  server: Server,
  info: ParticipantInfo
): ParticipantHandler => ({
  handleLookupRequest: handleLookupRequest(server, info),
  executeLookupRequest: queryParticipant
});

const testStorageService = async () => {
  const { application, publisher, audition } = await testAuditionStorage();
  return {
    getApplicationStorage: () => application,
    getAuditionStorage: () => audition,
    getPublisherStorage: () => publisher
  };
};

export const createILS = async () => {
  use(chaiHttp);

  const app = express();

  const proxy = proxyquire.noCallThru()("../../src/IntegrityLogServer", {
    ...ils,
    "common/communication/participantHandler": participantHandler
    //"./storage": testStorageService
  });

  await proxy.default(testServer, app);

  return request(app).keepOpen();
};
