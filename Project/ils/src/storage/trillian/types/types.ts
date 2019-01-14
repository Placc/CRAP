import { ITrillianLogClient } from "common/trillian/api/trillian_log_api_grpc_pb";
import { ITrillianMapClient } from "common/trillian/api/trillian_map_api_grpc_pb";
import {
  LogLeaf,
  Proof
} from "common/trillian/api/trillian_log_api_pb";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import { MapRootV1, LogRootV1 } from "common/trillian/types";
import { TreeInfo } from "common/participants/types";

export type MapRoot = {
  Version: number;
  V1: MapRootV1;
};

export type LogRoot = {
  Version: number;
  V1: LogRootV1;
};

export type ILSTrillianBase = {
  PublicKey: Uint8Array;
  TreeId: string;
};

export type ILSLogBase = ILSTrillianBase & {
  Log: ITrillianLogClient;
  Root: LogRootV1;
};

export type ILSMapBase = ILSTrillianBase & {
  Map: ITrillianMapClient;
  Root: MapRootV1;
};

export type LogRange = {
  start: string;
  count: string;
};

export type ILSLogServer = {
  TreeInfo: TreeInfo;
  AddLeaf: (leaf: LogLeaf) => Promise<LogRootV1>;
  GetInclusionProof: (hash: Uint8Array) => Promise<Proof[]>;
  GetConsistencyProof: (
    newRoot: LogRootV1,
    oldRoot?: LogRootV1
  ) => Promise<Proof>;
  GetRoot: () => Promise<LogRootV1>;
  GetLeavesByRange: (range: LogRange) => Promise<LogLeaf[]>;
};

export type ILSMapServer = {
  TreeInfo: TreeInfo;
  GetMapRoot: (revision?: string) => Promise<MapRootV1>;
  GetMapLeaves: (indexList: string[]) => Promise<MapLeafInclusion[]>;
  SetLeaves: (leaves: MapLeaf[], logRoot: LogRootV1) => Promise<MapRootV1>;
};

export type ILSLogClient = {
  TreeInfo: TreeInfo;
  AddLeaf: (leaf: LogLeaf) => Promise<LogRootV1>;
  GetInclusionProof: (hash: Uint8Array) => Promise<Proof[] | undefined>;
  GetRoot: () => Promise<LogRootV1>;
  VerifyInclusion: (leaf: LogLeaf) => Promise<boolean>;
  GetLeavesByRange: (range: LogRange) => Promise<LogLeaf[]>;
};

export type ILSMapClient = {
  TreeInfo: TreeInfo;
  GetMapRoot: () => Promise<MapRootV1>;
  GetAndVerifyMapLeaves: (indexList: string[]) => Promise<MapLeafInclusion[]>;
  SetLeaves: (leaves: MapLeaf[], logRoot: LogRootV1) => Promise<MapRootV1>;
};
