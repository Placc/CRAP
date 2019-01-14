import Long from "long";
import Hasher from "./hash/logHasher";
import { LogLeaf } from "./api/trillian_log_api_pb";
import ConiksHasher from "./hash/coniks";
import { LogEntry, Operation, MapEntry } from "./entry/entry_pb";
import { MapLeaf } from "./api/trillian_map_api_pb";
import { createHash } from "crypto";
import { MapLeaf as JSONMapLeaf, LogLeaf as JSONLogLeaf } from "./types";
import { Certificate } from "../certs/types";
import { stringify } from "../util/funs";

export const BuildLogLeafForEntry = (data: Uint8Array): LogLeaf => {
  const hash = Hasher.hashLeaf(data);

  const leaf = new LogLeaf();
  leaf.setLeafValue(data);
  leaf.setMerkleLeafHash(hash);

  return leaf;
};

export const BuildLogLeaf = (
  domain: string,
  cert: string,
  operation: Operation
): LogLeaf => {
  const entry = new LogEntry();
  entry.setDomain(domain);
  entry.setCert(cert);
  entry.setOperation(operation);

  return BuildLogLeafForEntry(entry.serializeBinary());
};

export const CreateMapIndex = (domain: string) => {
  return createHash("sha256")
    .update(domain)
    .digest("base64");
};

export const BuildMapLeafFromLogLeaf = (logLeaf: LogLeaf) => {
  const logEntry = LogEntry.deserializeBinary(logLeaf.getLeafValue_asU8());
  const mapEntry = new MapEntry();
  mapEntry.setDomain(logEntry.getDomain());

  switch (logEntry.getOperation()) {
    case Operation.CREATE:
    case Operation.UPDATE:
      mapEntry.setCert(logEntry.getCert());
      break;
    case Operation.DELETE:
      mapEntry.setCert("");
      break;
  }

  const mapLeafValue = mapEntry.serializeBinary();
  const mapLeafIndex = CreateMapIndex(logEntry.getDomain());
  const mapLeaf = new MapLeaf();
  mapLeaf.setIndex(mapLeafIndex);
  mapLeaf.setLeafValue(mapLeafValue);

  return mapLeaf;
};

export const BuildJSONMapLeafFromJSONLogLeaf = (
  jsonLogLeaf: JSONLogLeaf
): JSONMapLeaf => {
  const logLeaf = BuildLogLeafForEntry(jsonLogLeaf.leafValue);
  const mapLeaf = BuildMapLeafFromLogLeaf(logLeaf);

  return {
    extraData: mapLeaf.getExtraData_asU8(),
    index: mapLeaf.getIndex_asU8(),
    leafHash: mapLeaf.getLeafHash_asU8(),
    leafValue: mapLeaf.getLeafValue_asU8()
  };
};

export const BuildJSONMapLeafForEntry = (
  domain: string,
  cert?: Certificate
): JSONMapLeaf => {
  const mapEntry = new MapEntry();
  mapEntry.setDomain(domain);
  mapEntry.setCert(cert ? stringify(cert) : "");

  const mapLeafValue = mapEntry.serializeBinary();
  const mapLeafIndex = CreateMapIndex(domain);
  const mapLeaf = new MapLeaf();
  mapLeaf.setIndex(mapLeafIndex);
  mapLeaf.setLeafValue(mapLeafValue);

  return {
    extraData: mapLeaf.getExtraData_asU8(),
    index: mapLeaf.getIndex_asU8(),
    leafHash: mapLeaf.getLeafHash_asU8(),
    leafValue: mapLeaf.getLeafValue_asU8()
  };
};

const len8tab = [
  0x00,
  0x01,
  0x02,
  0x02,
  0x03,
  0x03,
  0x03,
  0x03,
  0x04,
  0x04,
  0x04,
  0x04,
  0x04,
  0x04,
  0x04,
  0x04,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x05,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x06,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x07,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08,
  0x08
];

export const len64 = (val: Long) => {
  let x = Long.fromValue(val);
  let n = 0;

  if (x.gte(Long.ONE.shiftLeft(32))) {
    x = x.shiftRightUnsigned(32);
    n = 32;
  }
  if (x.gte(Long.ONE.shiftLeft(16))) {
    x = x.shiftRightUnsigned(16);
    n += 16;
  }
  if (x.gte(Long.ONE.shiftLeft(8))) {
    x = x.shiftRightUnsigned(8);
    n += 8;
  }
  return n + len8tab[x.toInt()];
};

const m0 = Long.fromString("5555555555555555", true, 16);
const m1 = Long.fromString("3333333333333333", true, 16); // 00110011 ...
const m2 = Long.fromString("0f0f0f0f0f0f0f0f", true, 16); // 00001111 ...
const m3 = Long.fromString("00ff00ff00ff00ff", true, 16); // etc.
const m4 = Long.fromString("0000ffff0000ffff", true, 16);

export const onesCount64 = (val: Long) => {
  const x = Long.fromValue(val);
  const m = Long.MAX_UNSIGNED_VALUE;
  const x1 = x
    .shiftRightUnsigned(1)
    .and(m0.and(m))
    .add(x.and(m0.and(m)));
  const x2 = x1
    .shiftRightUnsigned(2)
    .and(m1.and(m))
    .add(x1.and(m1.and(m)));
  const x3 = x2
    .shiftRightUnsigned(4)
    .add(x2)
    .and(m2.and(m));
  const x4 = x3.add(x3.shiftRightUnsigned(8));
  const x5 = x4.add(x4.shiftRightUnsigned(16));
  const x6 = x5.add(x5.shiftRightUnsigned(32));
  return x6.toInt() & ((1 << 7) - 1);
};

export const bufferEqual = (buf1: Uint8Array, buf2: Uint8Array) => {
  return Buffer.from(buf1).toString("hex") == Buffer.from(buf2).toString("hex");
};

const deBruijn64 = Long.fromString("03f79d71b4ca8b09", true, 16);

var deBruijn64tab = [
  0,
  1,
  56,
  2,
  57,
  49,
  28,
  3,
  61,
  58,
  42,
  50,
  38,
  29,
  17,
  4,
  62,
  47,
  59,
  36,
  45,
  43,
  51,
  22,
  53,
  39,
  33,
  30,
  24,
  18,
  12,
  5,
  63,
  55,
  48,
  27,
  60,
  41,
  37,
  16,
  46,
  35,
  44,
  21,
  52,
  32,
  23,
  11,
  54,
  26,
  40,
  15,
  34,
  20,
  31,
  10,
  25,
  14,
  19,
  9,
  13,
  8,
  7,
  6
];

export const trailingZeros64 = (val: Long) => {
  const x = Long.fromValue(val);

  if (x.eq(0)) {
    return 64;
  }

  return deBruijn64tab[
    x
      .and(x.negate())
      .mul(deBruijn64)
      .shiftRightUnsigned(64 - 6)
      .toInt()
  ];
};
