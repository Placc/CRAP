import { isParticipant, isParticipantInfo } from "./guards";
import { isEmpty, isNil } from "lodash";
import { isString } from "util";
import { isCryptoKey } from "../crypto/guards";

export function isValidParticpantType(obj: any) {
  return (
    isString(obj) &&
    (obj == "ca" ||
      obj == "ils" ||
      obj == "monitor" ||
      obj == "publisher" ||
      obj == "auditor")
  );
}

export function isValidPublicKey(obj: any) {
  return (
    !isNil(obj) &&
    !isEmpty(obj.data) &&
    /*TODO: better format check*/ !isEmpty(obj.format)
  );
}

export function isValidParticipantInfo(obj: any) {
  return (
    isParticipantInfo(obj) &&
    !isEmpty(obj.url) &&
    isValidPublicKey(obj.publicKey) &&
    isValidParticpantType(obj.type)
  );
}

export function isValidParticipant(obj: any) {
  return isParticipant(obj) && isValidParticipantInfo(obj);
}
