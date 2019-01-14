import { CA, Participant, ILS } from "common/participants/types";
import { TreeRootDatabase } from "../db";
import {
  RootRequest,
  isRootRequest,
  RootResponse
} from "common/communication/requests/Root";
import { isParticipant } from "common/participants/guards";
import { ParticipantHandler } from "common/communication/types";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";
import { stringify } from "common/util/funs";
import { processRootRequest, isValidRootRequest } from "../requests/Root";

export const createRootHandler = (
  privateKey: CryptoKey,
  storage: TreeRootDatabase,
  participantHandler: ParticipantHandler
) => {
  const process = processRootRequest(
    privateKey,
    participantHandler.executeLookupRequest,
    storage
  );

  const valid = isValidRootRequest(
    participantHandler.executeLookupRequest,
    storage
  );

  return [
    {
      handle: process,
      validRequest: isRootRequest,
      validSender: isParticipant,
      validContent: valid
    }
  ];
};
