import { Request, Response } from "express";

export type ApplicationHandler = {
  handleDeployRequest: (req: Request, res: Response) => Promise<void>;
  handleDeleteRequest: (req: Request, res: Response) => Promise<void>;
};
