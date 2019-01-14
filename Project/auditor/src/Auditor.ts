import { Server } from "common/communication/types";
import { Express } from "express";
import { CertDatabase } from "./db";
import { ParticipantInfo } from "common/participants/types";
import bodyParser from "body-parser";
import NewParticipantHandler from "common/communication/participantHandler";
import { createAuditHandler } from "./handler/auditHandler";
import {
  AsyncMiddleware,
  GlobalErrorHandler
} from "common/communication/requestMiddleware";

type AuditorServer = {
  info: ParticipantInfo;
  storage: CertDatabase;
};

const initialize = (server: Server): AuditorServer => {
  const storage = new CertDatabase();
  const info: ParticipantInfo = {
    type: "auditor",
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

  const auditor = initialize(server);
  const participantHandler = NewParticipantHandler(server, auditor.info);
  const auditHandler = createAuditHandler(
    server,
    participantHandler,
    auditor.storage
  );

  app.get("/info", (_, res) => participantHandler.handleLookupRequest(res));

  app.post("/audit", AsyncMiddleware(auditHandler.handleAuditRequest));
  app.post("/delete", AsyncMiddleware(auditHandler.handleDeleteRequest));
  app.post("/get", AsyncMiddleware(auditHandler.handleGetSignatureRequest));

  app.use(GlobalErrorHandler);
};
