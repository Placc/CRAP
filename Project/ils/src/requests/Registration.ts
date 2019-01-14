import { Certificate } from "common/certs/types";
import { CA, ILS, Participant } from "common/participants/types";
import { ARPKICertStorage } from "../storage/types";
import { verifyNonExistence } from "./verification";
import { processModificationRequest } from "./modification";
import { CryptoKey } from "common/crypto/types";
import { RegistrationRequest } from "common/communication/requests/Registration";
import { isPublisher, isAuditor } from "common/participants/guards";

export const processRegistrationRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  sender: CA,
  request: RegistrationRequest<C>,
  requester: Participant
): Promise<void> => {
  if (!isPublisher(requester) && !isAuditor(requester)) {
    throw new Error("Invalid requester!");
  }

  await verifyNonExistence(request.cert, storage);

  await processModificationRequest(
    ils,
    privateKey,
    sender,
    requester,
    request,
    queryParticipant,
    storage,
    "RegistrationResponse",
    "register"
  );
};
