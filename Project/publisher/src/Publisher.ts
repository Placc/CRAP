import { Server } from "common/communication/types";
import { Express } from "express";
import { CertDatabase } from "./db";
import { ParticipantInfo } from "common/participants/types";
import bodyParser from "body-parser";
import NewParticipantHandler from "common/communication/participantHandler";
import { createApplicationHandler } from "./handler/applicationHandler";
import {
  AsyncMiddleware,
  GlobalErrorHandler
} from "common/communication/requestMiddleware";

type PublisherServer = {
  info: ParticipantInfo;
  storage: CertDatabase;
};

const initialize = (server: Server): PublisherServer => {
  const storage = new CertDatabase();
  const info: ParticipantInfo = {
    type: "publisher",
    publicKey: server.publicKey,
    url: server.url
  };

  return {
    info,
    storage
  };
};

export default async (server: Server, app: Express) => {
  app.use(bodyParser.text({ limit: "5120mb" }));
  app.use(bodyParser.json({ limit: "5120mb" }));

  const publisher = initialize(server);
  const participantHandler = NewParticipantHandler(server, publisher.info);
  const applicationHandler = createApplicationHandler(
    server,
    participantHandler,
    publisher.storage
  );

  app.get("/info", (_, res) => participantHandler.handleLookupRequest(res));

  app.post("/deploy", AsyncMiddleware(applicationHandler.handleDeployRequest));
  app.post("/delete", AsyncMiddleware(applicationHandler.handleDeleteRequest));

  app.use(GlobalErrorHandler);
};
