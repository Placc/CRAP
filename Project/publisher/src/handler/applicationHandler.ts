import { Server, ParticipantHandler } from "common/communication/types";
import { CertDatabase } from "../db";
import { Request, Response } from "express";
import {
  isDeployRequest,
  processDeployRequest,
  DeployRequest
} from "../requests/Deploy";
import { stringify } from "common/util/funs";
import {
  isDeleteRequest,
  processDeleteRequest,
  DeleteRequest
} from "../requests/Delete";
import { ApplicationHandler } from "./types";

export const createApplicationHandler = (
  server: Server,
  participantHandler: ParticipantHandler,
  storage: CertDatabase
): ApplicationHandler => {
  const processDeploy = processDeployRequest(
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

  const handleDeployRequest = requestHandler<DeployRequest>(
    isDeployRequest,
    async (req, res) => {
      const confirmation = await processDeploy(req);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.write(stringify(confirmation));
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

  return {
    handleDeployRequest,
    handleDeleteRequest
  };
};
