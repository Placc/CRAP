import { Participant, ParticipantInfo } from "common/participants/types";
import { isValidParticipantInfo } from "common/participants/validators";
import * as HttpRequest from "request";
import { Response, KeyPair } from "common/communication/types";
import { isResponse } from "common/communication/guards";
import { stringify } from "common/util/funs";
import { decryptPrivate, verify, encryptPublic } from "common/crypto/rsa";

export const queryParticipant = (
  staticKeys?: Map<string, KeyPair>,
  monitorKeys?: KeyPair
) => async (url: string): Promise<Participant> => {
  return new Promise<Participant>((resolve, reject) => {
    const params = {
      url: `${url}/info`,
      headers: {
        "Content-Type": "text/plain"
      },
      timeout: 60 * 60 * 1000
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

        if (staticKeys && staticKeys.has(participantInfo.url)) {
          participantInfo.publicKey = staticKeys.get(
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
                timeout: 60 * 60 * 1000,
                headers: {
                  "Content-Type": "text/plain",
                  "X-Public-Key": monitorKeys
                    ? JSON.stringify(monitorKeys.public)
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
                    if (monitorKeys) {
                      const decryptedBody = decryptPrivate(
                        body,
                        monitorKeys.private
                      );
                      response = JSON.parse(decryptedBody);
                    } else {
                      response = JSON.parse(body);
                    }

                    if (!isResponse(response)) {
                      throw new Error("Response is no known response type!");
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
