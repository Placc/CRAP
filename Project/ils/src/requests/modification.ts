import { ILS, CA, Participant, Publisher } from "common/participants/types";
import { Certificate, ARPKICert, MultiSignature } from "common/certs/types";
import { Signed, CryptoKey } from "common/crypto/types";
import { synchronize } from "./Synchronization";
import { ARPKICertStorage } from "../storage/types";
import { verifyParticipants } from "common/certs/verification";
import { sign } from "common/crypto/rsa";
import { ResponseType } from "common/communication/types";
import { head } from "lodash";
import { getStorageOperation } from "./storage";
import { MapRootV1 } from "common/trillian/types";
import { stringify } from "common/util/funs";
import { fromValue } from "long";
import {
  ModificationRequest,
  ModificationResponse
} from "common/communication/requests/Modification";
import { isValidARPKICert } from "common/certs/validators";

export const modify = async <C extends Certificate>(
  request: ModificationRequest<C>,
  storage: ARPKICertStorage<C>
): Promise<MapRootV1> => {
  const operation = getStorageOperation(request.type, storage);
  return await operation(request);
};

export const processModificationRequest = async <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  sender: CA,
  requester: Participant,
  request: ModificationRequest<C>,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: ARPKICertStorage<C>,
  responseType: ResponseType,
  endpoint: string
): Promise<void> => {
  verifyParticipants(ils, request.cert.caMin, request.cert, request.cert);

  if (head(request.cert.cas) != sender.url) {
    throw new Error("Requester is not initial CA!");
  }

  const cas = (await Promise.all(
    request.cert.cas.map(async ca => await queryParticipant(ca))
  )) as CA[];
  const ilses = (await Promise.all(
    request.cert.ilses
      .filter(participant => ils.url !== participant)
      .map(async ils => await queryParticipant(ils))
  )) as ILS[];

  if (!(await isValidARPKICert(request.cert, undefined, cas))) {
    throw new Error("Invalid ARPKI properties!");
  }

  const confirmationSignature = sign(request.cert, privateKey);
  const acceptanceConfirmation = {
    signature: confirmationSignature
  };

  const acknowledgements = await synchronize(
    request,
    acceptanceConfirmation,
    privateKey,
    ilses
  );
  const root = await modify(request, storage);

  try {
    const { consistencyProof, logProofs, mapProofs } = await storage.audit(
      fromValue(root.Revision)
        .sub(1)
        .toString()
    );
    const mapProof = head(mapProofs)!;
    const logProof = head(logProofs)!;

    const consistencyProofSignature = sign(consistencyProof, privateKey);
    const mapProofSignature = sign(mapProof, privateKey);
    const logProofSignature = sign(logProof, privateKey);
    const rootSignature = sign(root, privateKey);

    const rawResponse = {
      type: responseType,
      consistencyProof: stringify(consistencyProof),
      consistencyProofSignature,
      logProof: stringify(logProof),
      logProofSignature,
      mapProof: stringify(mapProof),
      mapProofSignature,
      root: stringify(root),
      rootSignature: { signature: rootSignature },
      acceptanceConfirmation,
      acknowledgements,
      request,
      nonce: request.nonce
    };

    const response: ModificationResponse<C> = {
      ...rawResponse,
      nonceSignature: {
        signature: sign(rawResponse, privateKey)
      }
    };

    const remainingIndex = request.cert.cas.length - 1;
    if (remainingIndex > 0) {
      await cas[remainingIndex].send(endpoint, response, requester);
    } else {
      await sender.send(endpoint, response, requester);
    }
  } catch (e) {
    //TODO reset is not part of this prototype, implement it for production!
    throw e;
  }
};
