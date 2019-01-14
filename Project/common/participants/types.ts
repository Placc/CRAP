import { Request, Response } from "../communication/types";
import { Certificate } from "../certs/types";
import { CryptoKey } from "../crypto/types";

export type ParticipantType =
  | "ca"
  | "ils"
  | "monitor"
  | "publisher"
  | "auditor";

export interface ParticipantInfo {
  type: ParticipantType;
  url: string;
  publicKey: CryptoKey;
}

export interface Participant extends ParticipantInfo {
  send: (
    endpoint: string,
    req: Request | Response,
    requester?: Participant,
    requesterSignature?: string
  ) => Promise<Response | void>;
}

export interface CA extends Participant {
  type: "ca";
}

export enum ContentType {
  PUBLISHER_CERTIFICATE = 0,
  APPLICATION_CERTIFICATE = 1,
  AUDIT_CERTIFICATE = 2
}

export enum TreeType {
  LOG = 1,
  MAP = 2
}

export type TreeInfo = {
  ContentType: ContentType;
  TreeType: TreeType;
  TreeId: string;
  PublicKey: Uint8Array;
};

export interface ILSInfo extends ParticipantInfo {
  trees: TreeInfo[];
}

export interface ILS extends Participant, ILSInfo {
  type: "ils";
}

export interface Monitor extends Participant {
  type: "monitor";
}

export interface Publisher extends Participant {
  type: "publisher";
}

export interface Auditor extends Participant {
  type: "auditor";
}
