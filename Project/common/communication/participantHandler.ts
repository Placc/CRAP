import { Participant, ParticipantInfo } from "../participants/types";
import * as HttpRequest from "request";
import { isValidParticipantInfo } from "..//participants/validators";
import { Request, Response } from "./types";
import { isResponse } from "./guards";
import { sign, encryptPublic, decryptPrivate, verify } from "../crypto/rsa";
import { stringify } from "../util/funs";
import { Server } from "./types";
import { isString } from "util";
import { Response as HttpResponse } from "express";
import { ParticipantHandler } from "./types";
import { createMessage } from "./message";

const sendRequest = (participant: ParticipantInfo, server: Server) => (
  endpoint: string,
  request: Request | Response,
  requester?: Participant
): Promise<Response | void> => {
  return new Promise<Response | void>((resolve, reject) => {
    const encryptedMessage = createMessage(request, participant, server);

    const serverUrl = server ? server.url : "";
    const participantUrl = participant.url.startsWith("http://")
      ? participant.url
      : `http://${participant.url}`;
    const params = {
      url: `${participantUrl}/${endpoint}`,
      body: encryptedMessage,
      timeout: 60 * 60 * 1000,
      headers: {
        "Content-Type": "text/plain",
        "X-Forwarded-For": `${
          requester ? [requester.url, serverUrl].join() : serverUrl
        }`,
        "X-Public-Key": JSON.stringify(server.publicKey)
      }
    };

    HttpRequest.post(params, (error, res, body) => {
      if (error || res.statusCode >= 300) {
        reject(error || new Error(body));
        return;
      }

      if (res.statusCode == 200) {
        try {
          const decryptedBody = decryptPrivate(body, server.privateKey);
          const { messageSignature, ...response } = JSON.parse(decryptedBody);

          if (!verify(response, messageSignature, participant.publicKey)) {
            throw new Error("Could not verify response!");
          }

          if (!isResponse(response)) {
            throw new Error("Response is no known response type!");
          }

          resolve(response);
        } catch (e) {
          reject(
            new Error(
              `SendRequest error for request ${stringify(
                request
              )} to ${participantUrl}: ${e.message}\n${e.stack}`
            )
          );
          return;
        }
      } else {
        resolve();
      }
    });
  });
};

export const executeLookupRequest = (server: Server) => (
  url: string
): Promise<Participant> => {
  return new Promise<Participant>((resolve, reject) => {
    const participantUrl = url.startsWith("http://") ? url : `http://${url}`;
    const params = {
      url: `${participantUrl}/info`,
      timeout: 60 * 60 * 1000,
      headers: {
        "Content-Type": "text/plain",
        "X-Forwarded-For": server ? server.url : ""
      }
    };

    HttpRequest.get(params, (error, res, body) => {
      if (error || res.statusCode >= 300) {
        reject(error || new Error(body));
        return;
      }

      try {
        const { signature, ...participantInfo } = JSON.parse(body);

        if (!isValidParticipantInfo(participantInfo)) {
          reject(new Error(body + " is not a valid participant info!"));
          return;
        }

        if (server.staticKeys.has(participantUrl)) {
          participantInfo.publicKey = server.staticKeys.get(
            participantUrl
          )!.public;
        }

        if (!verify(participantInfo, signature, participantInfo.publicKey)) {
          reject(new Error("Invalid participant info signature!"));
        }

        resolve({
          send: sendRequest(participantInfo, server),
          ...participantInfo
        });
      } catch (e) {
        reject(e);
      }
    });
  });
};

export const handleLookupRequest = (server: Server, info: ParticipantInfo) => (
  res: HttpResponse
): void => {
  const ilsSignature = sign(info, server.privateKey);
  const message = stringify({ signature: ilsSignature, ...info });

  res.writeHead(200);
  res.write(message);
  res.end();
};

export default (server: Server, info: ParticipantInfo): ParticipantHandler => ({
  handleLookupRequest: handleLookupRequest(server, info),
  executeLookupRequest: executeLookupRequest(server)
});
