import { ProtocolHandler } from "common/communication/types";
import { Certificate } from "common/certs/types";
import { ILS } from "common/participants/types";
import {
  SynchronizationRequest,
  SynchronizationCommit
} from "common/communication/requests/Synchronization";

export type SynchronizationHandler<C extends Certificate> = {
  handleSyncRequest: ProtocolHandler<ILS, SynchronizationRequest<C>>;
  handleSyncCommit: ProtocolHandler<ILS, SynchronizationCommit>;
};
