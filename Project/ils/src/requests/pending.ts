import { getHash } from "common/util/funs";
import { Request } from "common/communication/types";

export type PendingRequest = {
  request: Request;
  timestamp: number;
};

export type RequestQueue = {
  pushPending: (request: Request) => void;
  popPending: (hash: string) => PendingRequest;
};

export const createQueue = (): RequestQueue => {
  const pendingRequests = new Map<string, PendingRequest>();

  const pushPending = (request: Request) => {
    const hash = getHash(request);
    const timestamp = Date.now();

    if (!pendingRequests.has(hash)) {
      pendingRequests.set(hash, { request, timestamp });
      return;
    }

    throw new Error("Already registered");
  };

  const popPending = (hash: string) => {
    if (!pendingRequests.has(hash)) {
      throw new Error("Request not found");
    }

    const pending = pendingRequests.get(hash)!;

    if (!pendingRequests.delete(hash)) {
      throw new Error("Could not remove");
    }

    return pending;
  };

  return {
    pushPending,
    popPending
  };
};
