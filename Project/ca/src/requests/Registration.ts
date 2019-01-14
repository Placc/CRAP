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
  RegistrationRequest,
  RegistrationResponse
} from "common/communication/requests/Registration";
import {
  processModificationRequest,
  processModificationResponse
} from "./modification";
import { TreeRootDatabase } from "../db";
import { CryptoKey } from "common/crypto/types";

export const processRegistrationRequest = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  requestHolder: RequestHolder
) => async (
  requester: Publisher | Auditor,
  request: RegistrationRequest<C>
) => {
  return await processModificationRequest(
    ca,
    requester,
    queryParticipant,
    requestHolder,
    request,
    "register"
  );
};

export const processRegistrationResponse = <C extends Certificate>(
  ca: CA,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: TreeRootDatabase,
  privateKey: CryptoKey,
  requestHolder: RequestHolder
) => async (
  sender: ILS | CA,
  response: RegistrationResponse<C>,
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
    "register"
  );
};
