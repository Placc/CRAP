import { Participant, ParticipantInfo } from "common/participants/types";
import { isValidParticipantInfo } from "common/participants/validators";
import * as HttpRequest from "browser-request";
import { Response } from "common/communication/types";
import { isResponse } from "common/communication/guards";
import { stringify } from "common/util/funs";
import { Configuration } from "./types";
import { decryptPrivate, verify, encryptPublic } from "common/crypto/rsa";

export const queryParticipant = (configuration?: Configuration) => async (
  participantUrl: string
): Promise<Participant> => {
  return new Promise<Participant>((resolve, reject) => {
    const url = configuration
      ? configuration!.urlMappings.get(participantUrl) || participantUrl
      : participantUrl;

    const params = {
      url: `${url}/info`,
      headers: {
        "Content-Type": "text/plain"
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

        if (
          configuration &&
          configuration.staticKeys.has(participantInfo.url)
        ) {
          participantInfo.publicKey = configuration.staticKeys.get(
            participantInfo.url
          )!.public;
        }

        resolve({
          ...participantInfo,
          send: (endpoint, request) => {
            return new Promise<Response>((resolve, reject) => {
              const encryptedMessage = encryptPublic(
                stringify(request),
                participantInfo.publicKey
              );

              const params = {
                url: `${url}/${endpoint}`,
                body: encryptedMessage,
                headers: {
                  "Content-Type": "text/plain",
                  "X-Public-Key": configuration
                    ? JSON.stringify(configuration.clientKeys.public)
                    : undefined
                }
              };

              HttpRequest.post(params, (error, res, body) => {
                if (error || res.statusCode >= 300) {
                  reject(error || new Error(body));
                  return;
                }

                if (res.statusCode == 200) {
                  try {
                    let response: Response;

                    if (configuration) {
                      const decryptedBody = decryptPrivate(
                        body,
                        configuration!.clientKeys.private
                      );
                      response = JSON.parse(decryptedBody);
                    } else {
                      response = JSON.parse(body);
                    }

                    if (!isResponse(response)) {
                      reject(new Error("Response is no known response type!"));
                    }

                    resolve(response);
                  } catch (e) {
                    reject(
                      new Error(
                        `Error for request ${stringify(request)} to ${url}: ${
                          e.message
                        }\n${e.stack}`
                      )
                    );
                    return;
                  }
                } else {
                  resolve();
                }
              });
            });
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  });
};
