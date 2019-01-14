import { Express } from "express";
import bodyParser from "body-parser";
import { createCertificateHandler } from "./handler/certificateHandler";
import {
  Server,
  ParticipantHandler,
  ProtocolHandler
} from "common/communication/types";
import createStorageService, { StorageService } from "./storage";
import {
  ParticipantType,
  ILS,
  ILSInfo,
  Publisher,
  Participant,
  CA,
  Auditor
} from "common/participants/types";
import NewParticipantHandler from "common/communication/participantHandler";
import { flatten } from "lodash";
import {
  isPublisherType,
  isAuditionType,
  isApplicationType
} from "common/certs/guards";
import {
  isValidPublisherCertificate,
  isValidAuditionCertificate,
  isValidApplicationCertificate
} from "common/certs/validators";
import { createSynchronizationHandler } from "./handler/synchronizationHandler";
import { createQueue } from "./requests/pending";
import {
  createSecureRequestMiddleware,
  GlobalErrorHandler
} from "common/communication/requestMiddleware";
import {
  isPublisher,
  isILS,
  isParticipant,
  isAuditor
} from "common/participants/guards";
import { GetRequest } from "common/communication/requests/Get";
import { AuditRequest } from "common/communication/requests/Audit";
import { createRootHandler } from "./handler/rootHandler";

type IntegrityLogServer = {
  storage: StorageService;
  info: ILSInfo;
};

const initialize = async (server: Server): Promise<IntegrityLogServer> => {
  const storageService = await createStorageService();
  return {
    storage: storageService,
    info: {
      type: "ils" as ParticipantType,
      url: server.url,
      publicKey: server.publicKey,
      trees: flatten([
        storageService.getApplicationStorage().info(),
        storageService.getAuditionStorage().info(),
        storageService.getPublisherStorage().info()
      ])
    }
  };
};

const createProtocolHandlers = async (
  ils: IntegrityLogServer,
  participantHandler: ParticipantHandler,
  server: Server
) => {
  const thisILS = {
    ...ils.info,
    send: (_e, _r) => Promise.reject()
  } as ILS;

  const requestQueue = createQueue();

  const createHandler = createCertificateHandler(
    server,
    thisILS,
    participantHandler
  );
  const createSyncHandler = createSynchronizationHandler(
    server,
    thisILS,
    requestQueue,
    participantHandler
  );

  const rootHandlers = createRootHandler(
    thisILS,
    server.privateKey,
    ils.storage
  );

  const validPublisherCert = isValidPublisherCertificate(
    subject => ils.storage.getPublisherStorage().get(subject),
    participantHandler.executeLookupRequest,
    false
  );
  const validAuditionCert = isValidAuditionCertificate(
    url => ils.storage.getApplicationStorage().get(url),
    subject => ils.storage.getPublisherStorage().get(subject),
    participantHandler.executeLookupRequest
  );
  const validApplicationCert = isValidApplicationCertificate(
    subject => ils.storage.getPublisherStorage().get(subject),
    participantHandler.executeLookupRequest
  );

  const certHandlers = [
    createHandler(
      "PublisherCertificate",
      ils.storage.getPublisherStorage(),
      validPublisherCert,
      isPublisherType
    ),
    createHandler(
      "AuditionCertificate",
      ils.storage.getAuditionStorage(),
      validAuditionCert,
      isAuditionType
    ),
    createHandler(
      "ApplicationCertificate",
      ils.storage.getApplicationStorage(),
      validApplicationCert,
      isApplicationType
    )
  ];

  const syncHandlers = [
    createSyncHandler(ils.storage.getPublisherStorage(), validPublisherCert),
    createSyncHandler(
      ils.storage.getApplicationStorage(),
      validApplicationCert
    ),
    createSyncHandler(ils.storage.getAuditionStorage(), validAuditionCert)
  ];

  return {
    certs: certHandlers,
    sync: syncHandlers,
    root: rootHandlers,
    info: participantHandler.handleLookupRequest
  };
};

export default async (server: Server, app: Express) => {
  app.use(bodyParser.text({ limit: "5120mb" }));

  const ils = await initialize(server);
  const participantHandler = NewParticipantHandler(server, ils.info);

  const isModifier = (requester): requester is Publisher | Auditor => {
    return isPublisher(requester) || isAuditor(requester);
  };
  const modificationMiddleware = createSecureRequestMiddleware<
    Publisher | Auditor
  >(server, isModifier, participantHandler);

  const proofMiddleware = createSecureRequestMiddleware<Participant>(
    server,
    isParticipant,
    participantHandler
  );

  const syncMiddleware = createSecureRequestMiddleware<ILS>(
    server,
    isILS,
    participantHandler
  );

  const { certs, sync, root, info } = await createProtocolHandlers(
    ils,
    participantHandler,
    server
  );

  app.get("/info", (_, res) => info(res));

  app.post(
    "/register",
    modificationMiddleware(
      certs.map(handler => handler.handleRegistrationRequest)
    )
  );
  app.post(
    "/update",
    modificationMiddleware(certs.map(handler => handler.handleUpdateRequest))
  );
  app.post(
    "/get",
    proofMiddleware(
      certs.map(
        handler => handler.handleGetRequest as ProtocolHandler<CA, GetRequest>
      )
    )
  );
  app.post(
    "/audit",
    proofMiddleware(
      certs.map(
        handler =>
          handler.handleAuditRequest as ProtocolHandler<CA, AuditRequest>
      )
    )
  );
  app.post("/root", proofMiddleware(root));

  app.post(
    "/sync",
    syncMiddleware(sync.map(handler => handler.handleSyncRequest))
  );
  app.post(
    "/sync/commit",
    syncMiddleware(sync.map(handler => handler.handleSyncCommit))
  );

  //Explicitly don't handle delete requests for PublisherCertificates
  app.post(
    "/delete",
    modificationMiddleware(
      certs
        .filter(handler => handler.certType !== "PublisherCertificate")
        .map(handler => handler.handleDeleteRequest)
    )
  );

  app.use(GlobalErrorHandler);
};
