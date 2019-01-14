import { Server, ParticipantHandler } from "common/communication/types";
import { CertDatabase } from "../db";
import { Request, Response } from "express";
import {
  isAuditRequest,
  processAuditRequest,
  AuditRequest
} from "../requests/Audit";
import { stringify } from "common/util/funs";
import {
  isDeleteRequest,
  processDeleteRequest,
  DeleteRequest
} from "../requests/Delete";
import { AuditHandler } from "./types";
import {
  GetSignatureRequest,
  isGetSignatureRequest
} from "common/communication/requests/GetSignature";
import { processGetSignatureRequest } from "../requests/GetSignature";

export const createAuditHandler = (
  server: Server,
  participantHandler: ParticipantHandler,
  storage: CertDatabase
): AuditHandler => {
  const processAudit = processAuditRequest(
    server.publicKey,
    server.privateKey,
    participantHandler.executeLookupRequest,
    storage
  );

  const processDelete = processDeleteRequest(
    server.privateKey,
    participantHandler.executeLookupRequest,
    storage
  );

  const processGetSignature = processGetSignatureRequest(
    server.privateKey,
    storage
  );

  const requestHandler = <T>(
    validBody: (req: any) => req is T,
    callable: (req: T, res: Response) => Promise<void>
  ) => async (req: Request, res: Response) => {
    if (validBody(req.body)) {
      try {
        await callable(req.body, res);
      } catch (e) {
        res.writeHead(500);
        res.write(e.message);
        res.end();
      }
    } else {
      res.writeHead(400);
      res.write("Invalid request");
      res.end();
    }
  };

  const handleAuditRequest = requestHandler<AuditRequest>(
    isAuditRequest,
    async (req, res) => {
      await processAudit(req);

      res.writeHead(204);
      res.end();
    }
  );

  const handleDeleteRequest = requestHandler<DeleteRequest>(
    isDeleteRequest,
    async (req, res) => {
      await processDelete(req);

      res.writeHead(204);
      res.end();
    }
  );

  const handleGetSignatureRequest = requestHandler<GetSignatureRequest>(
    isGetSignatureRequest,
    async (req, res) => {
      const response = await processGetSignature(req);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.write(stringify(response));
      res.end();
    }
  );

  return {
    handleAuditRequest,
    handleDeleteRequest,
    handleGetSignatureRequest
  };
};
