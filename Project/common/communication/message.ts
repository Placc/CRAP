import { Participant, ParticipantInfo } from "../participants/types";
import { decryptPrivate, verify, sign, encryptPublic } from "../crypto/rsa";
import { Server } from "./types";
import { stringify } from "../util/funs";
import { Request, Response } from "./types";
import { isRequest, isResponse, isSignedRequest } from "./guards";

export const createMessage = (
  obj: Request | Response,
  receiver: ParticipantInfo,
  server: Server
): string => {
  const messageSignature = sign(obj, server.privateKey);
  const plainMessage = stringify({
    messageSignature,
    ...obj
  });

  return encryptPublic(plainMessage, receiver.publicKey);
};

export const parseMessage = (
  message: string,
  sender: Participant,
  requester: Participant,
  server: Server
): Request | Response => {
  const plainMessage = decryptPrivate(message, server.privateKey);
  const { messageSignature, ...request } = JSON.parse(plainMessage);

  if (!verify(request, messageSignature, sender.publicKey)) {
    throw new Error("Could not verify sender!");
  }

  if (isSignedRequest(request)) {
    const { signature, ...rawRequest } = request;
    if (!verify(rawRequest, signature, requester.publicKey)) {
      throw new Error("Could not verify response!");
    }
  } else if (isResponse(request) && isSignedRequest(request.request)) {
    const { signature, ...responseRequest } = request.request;
    if (!verify(responseRequest, signature, requester.publicKey)) {
      throw new Error("Could not verify request!");
    }
  }

  return request;
};
