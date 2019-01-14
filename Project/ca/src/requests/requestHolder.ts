import { Response, Request } from "common/communication/types";
import { RequestAwaiter } from "common/communication/awaiter";
import { stringify, getHash } from "common/util/funs";

export type RequestHolder = {
  notifyResult: (request: Request, response: Response | Error) => void;
  newRequest: <R extends Response>(
    request: Request,
    responseGuard: (res: Response | Error) => res is R
  ) => RequestAwaiter<R>;
};

const REQUEST_MAP = new Map<string, RequestAwaiter<any>[]>();

export const createRequestHolder = (): RequestHolder => ({
  notifyResult: (request: Request, response: Response | Error) => {
    const requestHash = getHash(request);
    if (REQUEST_MAP.has(requestHash)) {
      const awaiters = REQUEST_MAP.get(requestHash)!;
      REQUEST_MAP.delete(requestHash);
      awaiters.forEach(awaiter => awaiter.resolve(response));
    }
  },
  newRequest: <R extends Response>(
    request: Request,
    responseGuard: (res: Response | Error) => res is R
  ) => {
    const requestHash = getHash(request);
    const resolveFunction = new RequestAwaiter(responseGuard);

    REQUEST_MAP.set(
      requestHash,
      (REQUEST_MAP.get(requestHash) || []).concat(resolveFunction)
    );

    return resolveFunction;
  }
});
