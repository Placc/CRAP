import { ILSMapClient, ILSMapBase } from "../types/types";
import { MapRootV1, LogRootV1 } from "common/trillian/types";
import { TrillianMapClient } from "common/trillian//api/trillian_map_api_grpc_pb";
import grpc from "grpc";
import {
  GetSignedMapRootRequest,
  GetSignedMapRootResponse,
  GetMapLeavesResponse,
  GetMapLeavesRequest,
  MapLeaf,
  SetMapLeavesResponse,
  SetMapLeavesRequest,
  MapLeafInclusion
} from "common/trillian//api/trillian_map_api_pb";
import { VerifyMapLeafInclusion } from "common/trillian/verification/mapVerifier";
import { createHash } from "crypto";
import {
  serializeLogRootMetadata,
  deserializeMapRoot
} from "../types/deserialize";
import { TreeInfo, TreeType } from "common/participants/types";

const GetMapRoot = (client: ILSMapBase) => async (): Promise<MapRootV1> => {
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

  const v1 = await deserializeMapRoot(response.getMapRoot()!);
  return v1;
};

const GetAndVerifyMapLeaves = (client: ILSMapBase) => async (
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

  const inclusionList = response.getMapLeafInclusionList();

  for (const inclusion of inclusionList) {
    const i = inclusion.toObject() as any;
    await VerifyMapLeafInclusion(client.TreeId, client.Root, i);
  }

  return inclusionList;
};

const SetLeaves = (client: ILSMapBase) => async (
  mapLeaves: MapLeaf[],
  logRoot: LogRootV1
): Promise<MapRootV1> => {
  //TODO enable multi-threading
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

  const newRoot = await deserializeMapRoot(response.getMapRoot()!);
  return newRoot;
};

const createIndex = (domain: string) => {
  return createHash("sha256")
    .update(domain)
    .digest("base64");
};

export default (treeInfo: TreeInfo): ILSMapClient => {
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
    GetAndVerifyMapLeaves: GetAndVerifyMapLeaves(clientBase),
    SetLeaves: SetLeaves(clientBase)
  };
};
