import { TrillianLogClient } from "common/trillian/api/trillian_log_api_grpc_pb";
import {
  LogLeaf,
  GetInclusionProofByHashRequest,
  QueueLeafResponse,
  QueueLeafRequest,
  GetInclusionProofByHashResponse,
  GetLatestSignedLogRootResponse,
  GetLatestSignedLogRootRequest,
  GetConsistencyProofRequest,
  GetConsistencyProofResponse,
  GetLeavesByRangeRequest,
  GetLeavesByRangeResponse,
  Proof,
  GetLeavesByHashResponse,
  GetLeavesByHashRequest
} from "common/trillian/api/trillian_log_api_pb";
import { ILSLogBase, LogRange, ILSLogServer } from "../types/types";
import { LogRootV1 } from "common/trillian/types";
import { deserializeLogRoot } from "../types/deserialize";
import { fromValue } from "long";
import { Backoff } from "./backoff";
import grpc from "grpc";
import { BuildLogLeafForEntry } from "common/trillian/util";
import { isEqual } from "lodash";
import { TreeInfo, TreeType } from "common/participants/types";

export const GetLatestRoot = (client: ILSLogBase) => async () => {
  const request = new GetLatestSignedLogRootRequest();
  request.setLogId(client.TreeId);

  const response = await new Promise<GetLatestSignedLogRootResponse>(
    (resolve, reject) => {
      client.Log.getLatestSignedLogRoot(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return await deserializeLogRoot(response.getSignedLogRoot()!);
};

export const QueueLeaf = (client: ILSLogBase) => (logLeaf: LogLeaf) => {
  return new Promise<QueueLeafResponse>((resolve, reject) => {
    const request = new QueueLeafRequest();
    request.setLogId(client.TreeId);
    request.setLeaf(logLeaf);

    client.Log.queueLeaf(request, async (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res);
    });
  });
};

export const AddLeaf = (client: ILSLogBase) => async (logLeaf: LogLeaf) => {
  const response = await QueueLeaf(client)(logLeaf);
  if (
    !response.hasQueuedLeaf() ||
    !response.getQueuedLeaf()!.hasLeaf() ||
    (response.getQueuedLeaf()!.hasStatus() &&
      response
        .getQueuedLeaf()!
        .getStatus()!
        .getCode() != grpc.status.OK)
  ) {
    throw new Error(`Couldn't queue leaf`);
  }

  await WaitForInclusion(client)(logLeaf);

  return client.Root;
};

export const GetLeavesByHash = (client: ILSLogBase) => async (
  ...hashes: Uint8Array[]
) => {
  const response = await new Promise<GetLeavesByHashResponse>(
    (resolve, reject) => {
      const request = new GetLeavesByHashRequest();
      request.setLogId(client.TreeId);
      request.setLeafHashList(hashes);

      client.Log.getLeavesByHash(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return response.getLeavesList();
};

export const WaitForInclusion = (client: ILSLogBase) => async (
  leaf: LogLeaf
) => {
  const hash = BuildLogLeafForEntry(leaf.getLeafValue_asU8()).getMerkleLeafHash_asU8();

  do {
    if (fromValue(client.Root.TreeSize).gte(1)) {
      try {
        const leaves = await GetLeavesByHash(client)(hash);
        if (leaves.length > 0) {
          return;
        }
      } catch (error) {
        if (error && error.message && !error.message.includes("NOT_FOUND")) {
          throw error;
        }
      }
    }

    await WaitForRootUpdate(client)();
  } while (true);
};

export const WaitForRootUpdate = (client: ILSLogBase) => async () => {
  const options = {
    min: 100,
    max: 10000,
    factor: 2,
    jitter: true,
    timeout: 60000
  };

  await Backoff(options, UpdateRoot(client));
};

export const UpdateRoot = (client: ILSLogBase) => async () => {
  const root = await GetLatestRoot(client)();

  if (
    fromValue(root.TimestampNanos).gt(client.Root.TimestampNanos) &&
    fromValue(root.TreeSize).gte(client.Root.TreeSize)
  ) {
    client.Root = root;
    return root;
  } else {
    throw new Error("No new root available!");
  }
};

export const GetInclusionProof = (client: ILSLogBase) => async (
  hash: Uint8Array
): Promise<Proof[]> => {
  const request = new GetInclusionProofByHashRequest();
  request.setLeafHash(hash);
  request.setLogId(client.TreeId);
  request.setTreeSize(client.Root.TreeSize);

  const response = await new Promise<GetInclusionProofByHashResponse>(
    (resolve, reject) => {
      client.Log.getInclusionProofByHash(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return response.getProofList();
};

export const GetLeavesByRange = (client: ILSLogBase) => async (
  range: LogRange
) => {
  const request = new GetLeavesByRangeRequest();
  request.setLogId(client.TreeId);
  request.setStartIndex(range.start);
  request.setCount(range.count);

  const response = await new Promise<GetLeavesByRangeResponse>(
    (resolve, reject) => {
      client.Log.getLeavesByRange(request, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return response.getLeavesList();
};

export const GetConsistencyProof = (client: ILSLogBase) => async (
  newRoot: LogRootV1,
  oldRoot?: LogRootV1
) => {
  const old = oldRoot || client.Root;
  const trustedSize = fromValue(old.TreeSize);
  const logSize = fromValue(newRoot.TreeSize);

  if (
    trustedSize.equals(0) ||
    (logSize.equals(old.TreeSize) &&
      isEqual(newRoot.RootHash, client.Root.RootHash))
  ) {
    return new Proof();
  }

  const consistencyRequest = new GetConsistencyProofRequest();
  consistencyRequest.setLogId(client.TreeId);
  consistencyRequest.setFirstTreeSize(old.TreeSize);
  consistencyRequest.setSecondTreeSize(newRoot.TreeSize);

  const consistencyResponse = await new Promise<GetConsistencyProofResponse>(
    (resolve, reject) => {
      client.Log.getConsistencyProof(consistencyRequest, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    }
  );

  return consistencyResponse.getProof()!;
};

export default (treeInfo: TreeInfo): ILSLogServer => {
  if (treeInfo.TreeType != TreeType.LOG) {
    throw new Error("TreeType is not LOG!");
  }

  const serverBase: ILSLogBase = {
    PublicKey: treeInfo.PublicKey,
    Log: new TrillianLogClient(
      process.env.LOG_SERVER || "trillian-log-server:8090",
      grpc.credentials.createInsecure()
    ),
    TreeId: treeInfo.TreeId,
    Root: {
      Signature: new Uint8Array(0),
      Metadata: new Uint8Array(0),
      Revision: "0",
      RootHash: new Uint8Array(0),
      TimestampNanos: "0",
      TreeSize: "0"
    }
  };

  return {
    TreeInfo: treeInfo,
    AddLeaf: AddLeaf(serverBase),
    GetInclusionProof: GetInclusionProof(serverBase),
    GetConsistencyProof: GetConsistencyProof(serverBase),
    GetRoot: GetLatestRoot(serverBase),
    GetLeavesByRange: GetLeavesByRange(serverBase)
  };
};
