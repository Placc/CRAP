import { Certificate } from "common/certs/types";
import { processModificationRequest } from "./modification";
import { ILS, Participant, CA } from "common/participants/types";
import { ARPKICertStorage } from "../storage/types";
import { verifyExistence } from "./verification";
import { CryptoKey } from "common/crypto/types";
import { DeleteRequest } from "common/communication/requests/Delete";
import { isPublisher, isAuditor } from "common/participants/guards";

export const processDeleteRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  sender: CA,
  request: DeleteRequest<C>,
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
    "DeleteResponse",
    "delete"
  );
};
