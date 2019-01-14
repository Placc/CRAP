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
  Proof
} from "common/trillian/api/trillian_log_api_pb";
import { ILSLogBase, ILSLogClient, LogRange } from "../types/types";
import {
  VerifyInclusionByHash,
  VerifyRoot
} from "common/trillian/verification/logVerifier";
import { deserializeLogRoot } from "../types/deserialize";
import { fromValue } from "long";
import { isEqual } from "lodash";
import { Backoff } from "../server/backoff";
import grpc from "grpc";
import { BuildLogLeafForEntry } from "common/trillian/util";
import { TreeInfo, TreeType } from "common/participants/types";

export const GetAndVerifyLatestRoot = (client: ILSLogBase) => async () => {
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

  const logRoot = await deserializeLogRoot(response.getSignedLogRoot()!);

  const trustedSize = fromValue(client.Root.TreeSize);
  const logSize = fromValue(logRoot.TreeSize);
  if (
    trustedSize.gt(0) &&
    logSize.equals(client.Root.TreeSize) &&
    isEqual(logRoot.RootHash, client.Root.RootHash)
  )
    return logRoot;

  let consistencyResponse = new GetConsistencyProofResponse();

  if (trustedSize.gt(0)) {
    const consistencyRequest = new GetConsistencyProofRequest();
    consistencyRequest.setLogId(client.TreeId);
    consistencyRequest.setFirstTreeSize(client.Root.TreeSize);
    consistencyRequest.setSecondTreeSize(logRoot.TreeSize);

    consistencyResponse = await new Promise<GetConsistencyProofResponse>(
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
  }

  if (logSize.gt(0)) {
    const proof = consistencyResponse.getProof() || new Proof();

    await VerifyRoot(client.Root, logRoot, proof.getHashesList_asU8());
  }

  return logRoot;
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

export const WaitForInclusion = (client: ILSLogBase) => async (
  leaf: LogLeaf
) => {
  do {
    if (fromValue(client.Root.TreeSize).gte(1)) {
      const [proofs, error] = await GetAndVerifyInclusionProof(client)(leaf);

      if (proofs) {
        return;
      }
      if (error && error.message && !error.message.includes("NOT_FOUND")) {
        throw error;
      }
    }

    //TODO handle race condition.
    try {
      await WaitForRootUpdate(client)();
    } catch (e) {
      const [proofs, error] = await GetAndVerifyInclusionProof(client)(leaf);

      if (proofs) {
        return;
      }

      throw new Error(error ? `${error.message} (${e.message})` : e.message);
    }
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
  const root = await GetAndVerifyLatestRoot(client)();

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

export const VerifyInclusion = (client: ILSLogBase) => async (
  leaf: LogLeaf
) => {
  const [proofs, error] = await GetAndVerifyInclusionProof(client)(leaf);

  if (
    error &&
    error.message &&
    (!error.message.includes("NOT_FOUND") ||
      error.message.includes(`tree ${client.TreeId} not found`))
  ) {
    throw error;
  }

  if (!proofs || proofs.length == 0) {
    return false;
  }
  return true;
};

export const GetAndVerifyInclusionProof = (client: ILSLogBase) => async (
  leaf: LogLeaf
): Promise<[Proof[] | undefined, Error | null]> => {
  const hash = BuildLogLeafForEntry(
    leaf.getLeafValue_asU8()
  ).getMerkleLeafHash_asU8();

  const request = new GetInclusionProofByHashRequest();
  request.setLeafHash(hash);
  request.setLogId(client.TreeId);
  request.setTreeSize(client.Root.TreeSize);

  try {
    const proofs = await GetInclusionProof(client)(hash);
    return [proofs, null];
  } catch (e) {
    return [undefined, e];
  }
};

export const GetInclusionProof = (client: ILSLogBase) => async (
  hash: Uint8Array
): Promise<Proof[] | undefined> => {
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

  if (response.getProofList().length < 1) {
    return undefined;
  }

  for (const proof of response.getProofList()) {
    const p = proof.toObject() as any;
    VerifyInclusionByHash(client.Root, hash, p);
  }

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

  const leaves = response.getLeavesList();

  for (let i = 0; i < leaves.length; i++) {
    if (
      !fromValue(range.start)
        .add(i)
        .equals(leaves[i].getLeafIndex())
    ) {
      throw new Error(
        `Leaves[${i}].LEafIndex=${leaves[i].getLeafIndex()}, want ${fromValue(
          range.start
        ).add(i)}`
      );
    }
  }

  return leaves;
};

export default (treeInfo: TreeInfo): ILSLogClient => {
  if (treeInfo.TreeType != TreeType.LOG) {
    throw new Error("TreeType is not LOG!");
  }

  const clientBase: ILSLogBase = {
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
    AddLeaf: AddLeaf(clientBase),
    GetInclusionProof: GetInclusionProof(clientBase),
    GetRoot: GetAndVerifyLatestRoot(clientBase),
    VerifyInclusion: VerifyInclusion(clientBase),
    GetLeavesByRange: GetLeavesByRange(clientBase)
  };
};
