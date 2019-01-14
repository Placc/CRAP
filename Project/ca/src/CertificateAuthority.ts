import {
  Server,
  ParticipantHandler,
  UnsafeHandler
} from "common/communication/types";
import { Express } from "express";
import bodyParser from "body-parser";
import {
  Publisher,
  Participant,
  ParticipantInfo,
  ILS,
  CA,
  Auditor
} from "common/participants/types";
import NewParticipantHandler from "common/communication/participantHandler";
import {
  createSecureRequestMiddleware,
  GlobalErrorHandler,
  createUnsafeRequestMiddleware
} from "common/communication/requestMiddleware";
import {
  isPublisher,
  isParticipant,
  isAuditor
} from "common/participants/guards";
import { TreeRootDatabase } from "./db";
import {
  createQueryCertificateHandler,
  createCertificateObserver
} from "./handler/queryCertificate";
import { createGenerateHandlers } from "./handler/generateHandler";
import { createRequestHolder } from "./requests/requestHolder";
import {
  createRequestHandler,
  createResponseHandler
} from "./handler/certificateHandler";
import { Certificate, ARPKICert, CertificateType } from "common/certs/types";
import { verify } from "common/crypto/rsa";
import {
  isPublisherType,
  isApplicationType,
  isAuditionType,
  isPublisherCertificate,
  isApplicationCertificate,
  isAuditionCertificate,
  isARPKICert
} from "common/certs/guards";
import { GetRequest } from "common/communication/requests/Get";
import { AuditRequest } from "common/communication/requests/Audit";
import { createRootHandler } from "./handler/rootHandler";

type CertificateAuthority = {
  rootStorage: TreeRootDatabase;
  info: ParticipantInfo;
};

const initialize = (server: Server): CertificateAuthority => {
  const rootStorage = new TreeRootDatabase();
  const info: ParticipantInfo = {
    type: "ca",
    publicKey: server.publicKey,
    url: server.url
  };

  return {
    info,
    rootStorage
  };
};

const createProtocolHandlers = async (
  ca: CertificateAuthority,
  participantHandler: ParticipantHandler,
  server: Server
) => {
  const thisCA = {
    ...ca.info,
    send: (_e, _r) => Promise.reject()
  } as CA;

  const requestHolder = createRequestHolder();
  const requestHandler = createRequestHandler(
    thisCA,
    requestHolder,
    participantHandler
  );
  const responseHandler = createResponseHandler(
    server,
    thisCA,
    requestHolder,
    ca.rootStorage,
    participantHandler
  );

  const generateHandlers = createGenerateHandlers(
    thisCA,
    server.privateKey,
    participantHandler
  );

  const rootHandlers = createRootHandler(
    server.privateKey,
    ca.rootStorage,
    participantHandler
  );

  const getResponseObserver = createCertificateObserver();

  //Checking if we have signed the certificate is enough
  //as we validated it during generation!
  const validCert = (certType: CertificateType) => async (
    cert: ARPKICert<Certificate>
  ) => {
    if (isARPKICert(cert) && cert.type == certType) {
      const { signatures, ...rawCert } = cert;
      return signatures.some(signature =>
        verify(rawCert, signature, thisCA.publicKey)
      );
    }
    return false;
  };

  const requestHandlers = [
    requestHandler(
      "PublisherCertificate",
      validCert("PublisherCertificate"),
      isPublisherType
    ),
    requestHandler(
      "ApplicationCertificate",
      validCert("ApplicationCertificate"),
      isApplicationType
    ),
    requestHandler(
      "AuditionCertificate",
      validCert("AuditionCertificate"),
      isAuditionType
    )
  ];

  const responseHandlers = [
    responseHandler(
      "PublisherCertificate",
      validCert("PublisherCertificate"),
      isPublisherType
    ),
    responseHandler(
      "ApplicationCertificate",
      validCert("ApplicationCertificate"),
      isApplicationType
    ),
    responseHandler(
      "AuditionCertificate",
      validCert("AuditionCertificate"),
      isAuditionType
    )
  ];

  return {
    certs: {
      request: requestHandlers,
      response: responseHandlers
    },
    generate: generateHandlers,
    root: rootHandlers,
    observer: getResponseObserver,
    info: participantHandler.handleLookupRequest
  };
};

export default async (server: Server, app: Express) => {
  app.use(bodyParser.text({ limit: "5120mb" }));

  const ca = initialize(server);
  const participantHandler = NewParticipantHandler(server, ca.info);

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

  const {
    certs,
    generate,
    observer,
    root,
    info
  } = await createProtocolHandlers(ca, participantHandler, server);

  app.get("/info", (_, res) => info(res));
  app.post("/generate", modificationMiddleware(generate));

  app.post("/root", proofMiddleware(root));

  app.post(
    "/get",
    proofMiddleware(
      [observer, ...certs.response.map(handler => handler.handleGetResponse)],
      createUnsafeRequestMiddleware(
        server,
        certs.request.map(
          handler => handler.handleGetRequest as UnsafeHandler<GetRequest>
        )
      )
    )
  );

  app.post(
    "/register",
    modificationMiddleware(
      certs.request.map(handler => handler.handleRegistrationRequest),
      modificationMiddleware(
        certs.response.map(handler => handler.handleRegistrationResponse)
      )
    )
  );
  app.post(
    "/update",
    modificationMiddleware(
      certs.request.map(handler => handler.handleUpdateRequest),
      modificationMiddleware(
        certs.response.map(handler => handler.handleUpdateResponse)
      )
    )
  );

  //Explicitly don't handle delete requests for PublisherCertificates
  app.post(
    "/delete",
    modificationMiddleware(
      certs.request
        .filter(handler => handler.certType !== "PublisherCertificate")
        .map(handler => handler.handleDeleteRequest),
      modificationMiddleware(
        certs.response
          .filter(handler => handler.certType !== "PublisherCertificate")
          .map(handler => handler.handleDeleteResponse)
      )
    )
  );

  app.post(
    "/audit",
    proofMiddleware(
      certs.response.map(handler => handler.handleAuditResponse),
      createUnsafeRequestMiddleware(
        server,
        certs.request.map(
          handler => handler.handleAuditRequest as UnsafeHandler<AuditRequest>
        )
      )
    )
  );

  app.use(GlobalErrorHandler);
};
