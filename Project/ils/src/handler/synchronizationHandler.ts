import {
  processSynchronizationRequest,
  processSynchronizationCommit,
  isValidSyncContent,
  isValidCommitContent
} from "../requests/Synchronization";
import { Certificate, CertificateType } from "common/certs/types";
import { Server, ParticipantHandler } from "common/communication/types";
import { ILS } from "common/participants/types";
import { RequestQueue } from "../requests/pending";
import { isILS } from "common/participants/guards";
import { ARPKICertStorage } from "../storage/types";
import { SynchronizationHandler } from "./types";
import {
  SynchronizationRequest,
  isSynchronizationRequest,
  isSynchronizationCommit
} from "common/communication/requests/Synchronization";

export const createSynchronizationHandler = <C extends Certificate>(
  server: Server,
  thisILS: ILS,
  requestQueue: RequestQueue,
  participantHandler: ParticipantHandler
) => (
  storage: ARPKICertStorage<C>,
  validCert: (cert: Certificate) => Promise<boolean>
): SynchronizationHandler<C> => {
  const syncRequest = processSynchronizationRequest(
    thisILS,
    server.privateKey,
    requestQueue,
    storage,
    participantHandler.executeLookupRequest
  );

  const syncCommit = processSynchronizationCommit(
    server.privateKey,
    requestQueue,
    storage
  );

  const isSyncRequest = (obj: any): obj is SynchronizationRequest<C> =>
    isSynchronizationRequest<C>(obj);

  return {
    handleSyncRequest: {
      handle: syncRequest,
      validRequest: isSyncRequest,
      validSender: isILS,
      validContent: isValidSyncContent(validCert)
    },
    handleSyncCommit: {
      validSender: isILS,
      validRequest: isSynchronizationCommit,
      handle: syncCommit,
      validContent: isValidCommitContent
    }
  };
};
