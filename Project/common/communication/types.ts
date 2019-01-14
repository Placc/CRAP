import {
  Validity,
  CertificateType,
  Certificate,
  MultiSignature
} from "../certs/types";
import { ParticipantInfo, Participant } from "../participants/types";
import { Request as HttpRequest, Response as HttpResponse } from "express";
import { CryptoKey } from "../crypto/types";
import { GetRequest, GetResponse } from "./requests/Get";
import {
  RegistrationRequest,
  RegistrationResponse
} from "./requests/Registration";
import { UpdateRequest, UpdateResponse } from "./requests/Update";
import { DeleteRequest, DeleteResponse } from "./requests/Delete";
import { AuditRequest, AuditResponse } from "./requests/Audit";

export type ResponseType =
  | "RegistrationResponse"
  | "SynchronizationResponse"
  | "SynchronizationAcknowledge"
  | "UpdateResponse"
  | "DeleteResponse"
  | "GetResponse"
  | "AuditResponse"
  | "GenerateResponse"
  | "GetSignatureResponse"
  | "RootResponse";

export type RequestType =
  | "SynchronizationRequest"
  | "SynchronizationCommit"
  | "RegistrationRequest"
  | "UpdateRequest"
  | "DeleteRequest"
  | "GetRequest"
  | "AuditRequest"
  | "GenerateRequest"
  | "GetSignatureRequest"
  | "RootRequest";

export type Request = {
  type: RequestType;
  nonce: number;
};

export type SignedRequest = Request & {
  signature: string;
};

export type Response = {
  type: ResponseType;
  request: Request;
  nonce: number;
  nonceSignature: MultiSignature;
};

export type KeyPair = {
  public: CryptoKey;
  private: CryptoKey;
};

export type Server = {
  url: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  staticKeys: Map<String, KeyPair>;
};

export type ParticipantHandler = {
  handleLookupRequest: (res: HttpResponse) => void;
  executeLookupRequest: (url: string) => Promise<Participant>;
};

export type ProtocolHandler<
  T extends Participant,
  R extends Request | Response
> = {
  validSender: (sender: Participant) => sender is T;
  validContent: (request: R) => Promise<boolean>;
  validRequest: (request: Request | Response) => request is R;
  handle: (sender: T, request: R, requester: Participant) => Promise<any>;
};

export type UnsafeHandler<R extends Request | Response> = {
  validContent: (request: R) => Promise<boolean>;
  validRequest: (request: Request | Response) => request is R;
  handle: (request: R) => Promise<any>;
};

export type RequestHandler = (
  req: HttpRequest,
  res: HttpResponse,
  next: RequestHandler
) => void;

export type CertificateRequestHandler<
  P extends Participant,
  C extends Certificate
> = {
  certType: CertificateType;
  handleGetRequest: ProtocolHandler<P, GetRequest> | UnsafeHandler<GetRequest>;
  handleRegistrationRequest: ProtocolHandler<P, RegistrationRequest<C>>;
  handleUpdateRequest: ProtocolHandler<P, UpdateRequest<C>>;
  handleDeleteRequest: ProtocolHandler<P, DeleteRequest<C>>;
  handleAuditRequest:
    | ProtocolHandler<P, AuditRequest>
    | UnsafeHandler<AuditRequest>;
};

export type CertificateResponseHandler<
  P extends Participant,
  C extends Certificate
> = {
  certType: CertificateType;
  handleGetResponse: ProtocolHandler<P, GetResponse<C>>;
  handleRegistrationResponse: ProtocolHandler<P, RegistrationResponse<C>>;
  handleUpdateResponse: ProtocolHandler<P, UpdateResponse<C>>;
  handleDeleteResponse: ProtocolHandler<P, DeleteResponse<C>>;
  handleAuditResponse: ProtocolHandler<P, AuditResponse>;
};
