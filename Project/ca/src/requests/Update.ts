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
  UpdateRequest,
  UpdateResponse
} from "common/communication/requests/Update";
import {
  processModificationRequest,
  processModificationResponse
} from "./modification";
import { TreeRootDatabase } from "../db";
import { CryptoKey } from "common/crypto/types";

export const processUpdateRequest = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder
) => async (requester: Publisher | Auditor, request: UpdateRequest<C>) => {
  return await processModificationRequest(
    ca,
    requester,
    queryParticipant,
    requestHolder,
    request,
    "update"
  );
};

export const processUpdateResponse = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder
) => async (
  sender: ILS | CA,
  response: UpdateResponse<C>,
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
    "update"
  );
};
