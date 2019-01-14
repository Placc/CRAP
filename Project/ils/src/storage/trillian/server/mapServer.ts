import { ILSMapBase, ILSMapServer } from "../types/types";
import { LogRootV1, MapRootV1 } from "common/trillian/types";
import { TrillianMapClient } from "common/trillian/api/trillian_map_api_grpc_pb";
import grpc from "grpc";
import {
  GetSignedMapRootRequest,
  GetSignedMapRootResponse,
  GetMapLeavesResponse,
  GetMapLeavesRequest,
  MapLeaf,
  SetMapLeavesResponse,
  SetMapLeavesRequest,
  MapLeafInclusion,
  GetSignedMapRootByRevisionRequest
} from "common/trillian/api/trillian_map_api_pb";
import { createHash } from "crypto";
import {
  serializeLogRootMetadata,
  deserializeMapRoot
} from "../types/deserialize";
import { TreeInfo, TreeType } from "common/participants/types";
import { CreateMapIndex } from "common/trillian/util";

const GetMapRootByRevision = async (
  client: ILSMapBase,
  revision: string
): Promise<MapRootV1> => {
  const rootRequest = new GetSignedMapRootByRevisionRequest();
  rootRequest.setMapId(client.TreeId);
  rootRequest.setRevision(revision);

  const response = await new Promise<GetSignedMapRootResponse>(
    (resolve, reject) => {
      client.Map.getSignedMapRootByRevision(rootRequest, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return await deserializeMapRoot(response.getMapRoot()!);
};

const GetCurrentMapRoot = async (client: ILSMapBase): Promise<MapRootV1> => {
  const rootRequest = new GetSignedMapRootRequest();
  rootRequest.setMapId(client.TreeId);

  const response = await new Promise<GetSignedMapRootResponse>(
    (resolve, reject) => {
      client.Map.getSignedMapRoot(rootRequest, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return await deserializeMapRoot(response.getMapRoot()!);
};

const GetMapRoot = (client: ILSMapBase) => async (
  revision?: string
): Promise<MapRootV1> => {
  if (revision) {
    return GetMapRootByRevision(client, revision);
  }
  return GetCurrentMapRoot(client);
};

const GetMapLeaves = (client: ILSMapBase) => async (
  indexList: string[]
): Promise<MapLeafInclusion[]> => {
  const request = new GetMapLeavesRequest();
  request.setMapId(client.TreeId);
  request.setIndexList(indexList);

  const response = await new Promise<GetMapLeavesResponse>(
    (resolve, reject) => {
      client.Map.getLeaves(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return response.getMapLeafInclusionList();
};

const SetLeaves = (client: ILSMapBase) => async (
  mapLeaves: MapLeaf[],
  logRoot: LogRootV1
): Promise<MapRootV1> => {
  const request = new SetMapLeavesRequest();
  request.setMapId(client.TreeId);
  request.setLeavesList(mapLeaves);

  const metadata = serializeLogRootMetadata(logRoot);
  request.setMetadata(metadata);

  const response = await new Promise<SetMapLeavesResponse>(
    (resolve, reject) => {
      client.Map.setLeaves(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return await deserializeMapRoot(response.getMapRoot()!);
};

export default (treeInfo: TreeInfo): ILSMapServer => {
  if (treeInfo.TreeType != TreeType.MAP) {
    throw new Error("TreeType is not MAP!");
  }

  const clientBase: ILSMapBase = {
    PublicKey: treeInfo.PublicKey,
    Map: new TrillianMapClient(
      process.env.MAP_SERVER || "trillian-map-server:8093",
      grpc.credentials.createInsecure()
    ),
    TreeId: treeInfo.TreeId,
    Root: {
      Signature: new Uint8Array(0),
      LogRoot: {
        Signature: new Uint8Array(0),
        Metadata: new Uint8Array(0),
        Revision: "0",
        RootHash: new Uint8Array(0),
        TimestampNanos: "0",
        TreeSize: "0"
      },
      Revision: "0",
      RootHash: new Uint8Array(0),
      TimestampNanos: "0"
    }
  };

  return {
    TreeInfo: treeInfo,
    GetMapRoot: GetMapRoot(clientBase),
    GetMapLeaves: GetMapLeaves(clientBase),
    SetLeaves: SetLeaves(clientBase)
  };
};
