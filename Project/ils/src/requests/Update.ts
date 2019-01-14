import { Certificate } from "common/certs/types";
import { ILS, CA, Participant } from "common/participants/types";
import { ARPKICertStorage } from "../storage/types";
import { verifyExistence } from "./verification";
import { processModificationRequest } from "./modification";
import { CryptoKey } from "common/crypto/types";
import { UpdateRequest } from "common/communication/requests/Update";
import { isPublisher, isAuditor } from "common/participants/guards";

export const processUpdateRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  sender: CA,
  request: UpdateRequest<C>,
  requester: Participant
): Promise<void> => {
  if (!isPublisher(requester) && !isAuditor(requester)) {
    throw new Error("Invalid requester!");
  }

  await verifyExistence(request.cert, storage);

  await processModificationRequest(
    ils,
    privateKey,
    sender,
    requester,
    request,
    queryParticipant,
    storage,
    "UpdateResponse",
    "update"
  );
};
