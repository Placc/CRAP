import { Request, Response } from "express";

export type AuditHandler = {
  handleAuditRequest: (req: Request, res: Response) => Promise<void>;
  handleDeleteRequest: (req: Request, res: Response) => Promise<void>;
  handleGetSignatureRequest: (req: Request, res: Response) => Promise<void>;
};
