import { Certificate } from "common/certs/types";
import {
  CA,
  Participant,
  Publisher,
  ILS,
  Auditor
} from "common/participants/types";
import { RequestHolder } from "./requestHolder";
import {
  DeleteRequest,
  DeleteResponse
} from "common/communication/requests/Delete";
import {
  processModificationRequest,
  processModificationResponse
} from "./modification";
import { TreeRootDatabase } from "../db";
import { CryptoKey } from "common/crypto/types";

export const processDeleteRequest = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder
) => async (requester: Publisher | Auditor, request: DeleteRequest<C>) => {
  return await processModificationRequest(
    ca,
    requester,
    queryParticipant,
    requestHolder,
    request,
    "delete"
  );
};

export const processDeleteResponse = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder
) => async (
  sender: ILS | CA,
  response: DeleteResponse<C>,
  requester: Participant
) => {
  return await processModificationResponse(
    ca,
    requester,
    queryParticipant,
    storage,
    privateKey,
    requestHolder,
    response,
    "delete"
  );
};
