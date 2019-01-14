import { Participant, ILS, ILSInfo } from "common/participants/types";
import {
  RootRequest,
  RootResponse,
  isRootRequest
} from "common/communication/requests/Root";
import { stringify } from "common/util/funs";
import { sign } from "common/crypto/rsa";
import { CryptoKey } from "common/crypto/types";
import { AbstractStorage } from "../storage/AbstractStorage";
import { Certificate } from "common/certs/types";
import { fromValue } from "long";
import { isString } from "common/util/guards";

export const isValidRootRequest = (thisILS: ILSInfo) => (
  request: RootRequest
) => {
  return (
    isRootRequest(request) &&
    request.ils == thisILS.url &&
    isString(request.oldRevision) &&
    fromValue(request.oldRevision).lte(request.revision)
  );
};

export const processRootRequest = <C extends Certificate>(
  privateKey: CryptoKey,
  storage: AbstractStorage<C>
) => async (_s: Participant, request: RootRequest, _r: Participant) => {
  const { root, proof, latestEntry } = await storage.consistency(
    request.oldRevision!,
    request.revision
  );

  const rawResponse = {
    type: "RootResponse",
    nonce: request.nonce,
    request: request,
    root: stringify(root),
    consistencyProof: stringify(proof),
    cas: latestEntry.cas
  };

  const response: RootResponse = {
    ...rawResponse,
    type: "RootResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  return response;
};
