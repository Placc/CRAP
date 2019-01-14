import {
  ILS,
  Participant,
  Monitor,
  CA,
  Publisher,
  Auditor,
  ParticipantInfo,
  ILSInfo,
  TreeInfo
} from "./types";
import { isNil, isObject } from "lodash";
import { isString, isArrayOf, isNumber } from "../util/guards";
import { isCryptoKey } from "../crypto/guards";

export const isTreeInfo = (obj: any): obj is TreeInfo => {
  const validFields = ["ContentType", "TreeType", "TreeId", "PublicKey"];

  return (
    !isNil(obj) &&
    isNumber(obj["ContentType"]) &&
    isNumber(obj["TreeType"]) &&
    /*TODO better check*/ !isNil(obj["PublicKey"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
};

export function isParticipantInfo(obj: any): obj is ParticipantInfo {
  const validFields = [
    "type",
    "url",
    "publicKey",
    "trees",
    "send",
    "signature"
  ];

  return (
    !isNil(obj) &&
    isObject(obj) &&
    isString(obj["type"]) &&
    isString(obj["url"]) &&
    isCryptoKey(obj["publicKey"]) &&
    Object.keys(obj).every(key => validFields.some(field => key === field))
  );
}

export function isParticipant(obj: any): obj is Participant {
  return isParticipantInfo(obj) && typeof obj["send"] === "function";
}

export function isILSInfo(obj: any): obj is ILSInfo {
  return (
    isParticipantInfo(obj) && isArrayOf<TreeInfo>(obj["trees"], isTreeInfo)
  );
}

export function isILS(obj: any): obj is ILS {
  return isParticipant(obj) && obj.type === "ils";
}

export function isMonitor(obj: any): obj is Monitor {
  return isParticipant(obj) && obj.type === "monitor";
}

export function isCA(obj: any): obj is CA {
  return isParticipant(obj) && obj.type === "ca";
}

export function isPublisher(obj: any): obj is Publisher {
  return isParticipant(obj) && obj.type === "publisher";
}

export function isAuditor(obj: any): obj is Auditor {
  return isParticipant(obj) && obj.type === "auditor";
}
