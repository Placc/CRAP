import {
  ParticipantHandler,
  RequestHandler,
  ProtocolHandler,
  UnsafeHandler
} from "./types";
import { Server } from "./types";
import { parseMessage, createMessage } from "./message";
import { Request, Response } from "./types";
import { Participant } from "../participants/types";
import {
  Request as HttpRequest,
  Response as HttpResponse,
  ErrorRequestHandler
} from "express";
import { isEmpty, head, last } from "lodash";
import { stringify } from "../util/funs";
import ipaddr from "ipaddr.js";
import { RequestAwaiter } from "./awaiter";
import { decryptPrivate, decryptPublic, encryptPublic } from "../crypto/rsa";

class RequestError extends Error {
  constructor(
    public status: number,
    public message: string,
    public stack?: string
  ) {
    super();
  }
}

const updateError = (lastError: Error | undefined, newError: Error): Error => {
  if (
    !lastError ||
    (newError &&
      (!(newError instanceof RequestError) ||
        (lastError instanceof RequestError &&
          newError.status > lastError.status)))
  ) {
    return newError;
  }
  return lastError;
};

const resolveSender = (serverUrl: string, req: HttpRequest) => {
  let senderIp = req.connection.remoteAddress || req.socket.remoteAddress;
  let senderPort = req.connection.remotePort || req.socket.remotePort || "80";

  if (!senderIp) {
    throw new RequestError(
      400,
      `[${serverUrl}]: Could not resolve remoteAddress`
    );
  }

  if (ipaddr.isValid(senderIp)) {
    var addr = ipaddr.parse(senderIp);
    if (ipaddr.IPv6.isValid(senderIp)) {
      const v6addr = addr as ipaddr.IPv6;
      if (v6addr.isIPv4MappedAddress()) {
        senderIp = v6addr.toIPv4Address().toString();
      } else {
        senderIp = addr.toNormalizedString();
      }
    }
  }

  return `${senderIp}:${senderPort}`;
};

const resolveForwards = (req: HttpRequest, senderIp: string) => {
  const forwardedHeader = req.header("X-Forwarded-For");

  const forwards =
    forwardedHeader && !isEmpty(forwardedHeader)
      ? forwardedHeader.split(",").map(s => s.trim())
      : [senderIp];

  return forwards;
};

export const GlobalErrorHandler: ErrorRequestHandler = (err, _r, res, _n) => {
  console.log("ERROR: " + err.message);
  res.writeHead(err["status"] ? err["status"] : 500);
  res.write(err.message);
  res.end();
};

export const AsyncMiddleware = (
  fn: (req, res) => Promise<void>,
  customNext?: (...args: any[]) => void
) => (req, res, next) =>
  fn(req, res).catch(err => {
    if (customNext) {
      customNext(req, res, (nextErr?: Error) => {
        if (nextErr) {
          next(updateError(err, nextErr));
        }
      });
    } else {
      next(err);
    }
  });

export const createSecureRequestMiddleware = <S extends Participant>(
  server: Server,
  validRequester: (sender: Participant) => sender is S,
  participantHandler: ParticipantHandler
) => <P extends Participant, R extends Request | Response>(
  protocolHandlers: ProtocolHandler<P, R>[],
  next?: RequestHandler
): RequestHandler =>
  AsyncMiddleware(async (req: HttpRequest, res: HttpResponse) => {
    const senderIp = resolveSender(server.url, req);
    const forwards = resolveForwards(req, senderIp);

    //TODO in a real environment, use senderIp for security reasons!
    const sender = await participantHandler.executeLookupRequest(
      last(forwards)!
    );

    const requester =
      forwards.length > 1
        ? await participantHandler.executeLookupRequest(head(forwards)!)
        : sender;

    if (!validRequester(requester)) {
      throw new RequestError(
        401,
        `[${server.url}]: Illegal requester ${stringify(requester)} (${
          forwards.length > 1 ? head(forwards) : last(forwards)
        })`
      );
    }

    let lastError: Error | undefined = undefined;

    for (const protocolHandler of protocolHandlers) {
      if (!protocolHandler.validSender(sender)) {
        lastError = updateError(
          lastError,
          new RequestError(
            432,
            `[${server.url}]: Illegal sender ${stringify(sender)}`
          )
        );
        continue;
      }

      let request: Request | Response;
      try {
        const messageContent = Buffer.from(req.body).toString("utf8");
        request = parseMessage(messageContent, sender, requester, server);
      } catch (e) {
        lastError = updateError(
          lastError,
          new RequestError(400, `[${server.url}]: ${e.message} \n${e.stack}`)
        );
        continue;
      }

      if (!protocolHandler.validRequest(request)) {
        lastError = updateError(
          lastError,
          new RequestError(
            432,
            `[${server.url}]: Invalid request \n${stringify(request)}`
          )
        );
        continue;
      }

      if (!(await protocolHandler.validContent(request))) {
        lastError = updateError(
          lastError,
          new RequestError(
            433,
            `[${server.url}]: Invalid request content \n${stringify(request)}`
          )
        );
        continue;
      }

      try {
        const result = await protocolHandler.handle(sender, request, requester);

        if (!result) {
          res.writeHead(202);
          res.end();
        } else if (result instanceof RequestAwaiter) {
          result.onResponse((result, err) => {
            if (result) {
              const resultMessage = createMessage(result, sender, server);
              res.writeHead(200);
              res.write(resultMessage);
            } else {
              res.writeHead(900);
              res.write(`[${server.url}]: ${err.message}\n${err.stack}`);
            }
            res.end();
          });
        } else {
          const resultMessage = createMessage(result, sender, server);
          res.writeHead(200);
          res.write(resultMessage);
          res.end();
        }

        return;
      } catch (e) {
        lastError = updateError(
          lastError,
          new RequestError(500, `[${server.url}]: ${e.message}\n${e.stack}`)
        );
        continue;
      }
    }

    throw updateError(
      lastError,
      new RequestError(
        400,
        `[${server.url}]: Couldn't process request ${stringify(req.body)}`
      )
    );
  }, next);

export const createUnsafeRequestMiddleware = <R extends Request | Response>(
  server: Server,
  protocolHandlers: UnsafeHandler<R>[],
  next?: RequestHandler
): RequestHandler =>
  AsyncMiddleware(async (req: HttpRequest, res: HttpResponse) => {
    let lastError: Error | undefined = undefined;
    const requesterKey =
      req.header("X-Public-Key") && !isEmpty(req.header("X-Public-Key"))
        ? JSON.parse(req.header("X-Public-Key")!)
        : undefined;

    //TODO optionally query requester and pass to handle() on success
    for (const protocolHandler of protocolHandlers) {
      let request: Request | Response;
      try {
        const messageContent = Buffer.from(req.body).toString("utf8");
        const message = decryptPrivate(messageContent, server.privateKey);
        request = JSON.parse(message);
      } catch (e) {
        lastError = updateError(
          lastError,
          new RequestError(400, `[${server.url}]: ${e.message}\n${e.stack}`)
        );
        continue;
      }

      if (!protocolHandler.validRequest(request)) {
        lastError = updateError(
          lastError,
          new RequestError(
            432,
            `[${server.url}]: Invalid request\n${stringify(request)}`
          )
        );
        continue;
      }

      if (!(await protocolHandler.validContent(request))) {
        lastError = updateError(
          lastError,
          new RequestError(
            433,
            `[${server.url}]: Invalid request content\n${stringify(request)}`
          )
        );
        continue;
      }

      try {
        const result = await protocolHandler.handle(request);

        if (!result) {
          res.writeHead(202);
          res.end();
        } else if (result instanceof RequestAwaiter) {
          result.onResponse((result, err) => {
            if (result) {
              const resultMessage = stringify(result);
              const response = requesterKey
                ? encryptPublic(resultMessage, requesterKey)
                : resultMessage;
              res.writeHead(200);
              res.write(response);
            } else {
              res.writeHead(900);
              res.write(`[${server.url}]: ${err.message}\n${err.stack}`);
            }
            res.end();
          });
        } else {
          const resultMessage = stringify(result);
          const response = requesterKey
            ? encryptPublic(resultMessage, requesterKey)
            : resultMessage;
          res.writeHead(200);
          res.write(response);
          res.end();
        }

        return;
      } catch (e) {
        lastError = updateError(
          lastError,
          new RequestError(500, `[${server.url}]: ${e.message}\n${e.stack}`)
        );
        continue;
      }
    }

    throw updateError(
      lastError,
      new RequestError(
        400,
        `[${server.url}]: Couldn't process request\n${stringify(req.body)}`
      )
    );
  }, next);
