import { TrillianMapClient } from "common/trillian/api/trillian_map_api_grpc_pb";
import { TrillianLogClient } from "common/trillian/api/trillian_log_api_grpc_pb";
import { InitMapRequest } from "common/trillian/api/trillian_map_api_pb";
import { InitLogRequest } from "common/trillian/api/trillian_log_api_pb";
import { ITrillianAdminClient } from "common/trillian/api/trillian_admin_api_grpc_pb";
import {
  DeleteTreeRequest,
  CreateTreeRequest,
  ListTreesRequest
} from "common/trillian/api/trillian_admin_api_pb";
import {
  Tree,
  TreeState,
  HashStrategy,
  SignedMapRoot,
  SignedLogRoot
} from "common/trillian/api/trillian_pb";
import { DigitallySigned } from "common/trillian/crypto/sigpb/sigpb_pb";
import { Duration } from "google-protobuf/google/protobuf/duration_pb";
import { Specification } from "common/trillian/crypto/keyspb/keyspb_pb";
import * as DB from "mysql";
import * as log from "loglevel";
import { TreeInfo, TreeType } from "common/participants/types";

export const getExistingTrees = async (
  adminClient: ITrillianAdminClient
): Promise<Tree[]> => {
  return new Promise<Tree[]>((resolve, reject) => {
    const request = new ListTreesRequest();
    request.setShowDeleted(false);

    adminClient.listTrees(request, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(res.getTreeList());
    });
  });
};

export const deleteTree = async (
  treeId: string,
  adminClient: ITrillianAdminClient
): Promise<void> => {
  const request = new DeleteTreeRequest();
  request.setTreeId(treeId);

  return new Promise<void>((resolve, reject) => {
    adminClient.deleteTree(request, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const createTree = async (
  treeType: TreeType,
  adminClient: ITrillianAdminClient
): Promise<Tree> => {
  const maxRootDuration = new Duration();
  maxRootDuration.setSeconds(0);
  maxRootDuration.setNanos(0);

  const hashStrategy =
    treeType === TreeType.MAP
      ? HashStrategy.CONIKS_SHA512_256
      : HashStrategy.RFC6962_SHA256;

  const tree = new Tree();
  tree.setTreeState(TreeState.ACTIVE);
  tree.setTreeType(treeType);
  tree.setHashAlgorithm(DigitallySigned.HashAlgorithm.SHA256);
  tree.setHashStrategy(hashStrategy);
  tree.setSignatureAlgorithm(DigitallySigned.SignatureAlgorithm.RSA);
  tree.setDisplayName(`${treeType.toString()}`);
  tree.setDescription(`${treeType.toString()}`);
  tree.setMaxRootDuration(maxRootDuration);

  const keySpec = new Specification();
  keySpec.setRsaParams(new Specification.RSA());

  const request = new CreateTreeRequest();
  request.setTree(tree);
  request.setKeySpec(keySpec);

  return new Promise<Tree>((resolve, reject) => {
    adminClient.createTree(request, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      const createdAt = res!
        .getCreateTime()!
        .toDate()
        .toUTCString();
      log.debug(`Created tree ${res.getTreeId()} (at: ${createdAt})`);

      resolve(res);
    });
  });
};

export const initMap = async (
  mapId: string,
  mapClient: TrillianMapClient
): Promise<SignedMapRoot> => {
  return new Promise<SignedMapRoot>((resolve, reject) => {
    const initMap = new InitMapRequest();
    initMap.setMapId(mapId);

    mapClient.initMap(initMap, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res.getCreated());
    });
  });
};

export const initLog = async (
  logId: string,
  logClient: TrillianLogClient
): Promise<SignedLogRoot> => {
  return new Promise<SignedLogRoot>((resolve, reject) => {
    const initLog = new InitLogRequest();
    initLog.setLogId(logId);

    logClient.initLog(initLog, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res.getCreated());
    });
  });
};

export const queryDbTrees = async (db: any): Promise<TreeInfo[]> => {
  return new Promise<TreeInfo[]>((resolve, reject) => {
    db.query("SELECT * FROM Trees", (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      const treeInfos: TreeInfo[] = results.map(result => {
        result.PublicKey = new Uint8Array(result.PublicKey);
        return result as TreeInfo;
      });

      resolve(treeInfos);
    });
  });
};

export const deleteDbTree = async (id: string, db: any): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM Trees WHERE TreeId = ?", id, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

export const insertDbTree = async (info: TreeInfo, db: any): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.query(
      "INSERT INTO Trees VALUES (?,?,?,?)",
      [
        `${info.ContentType}`,
        `${info.TreeType}`,
        info.TreeId,
        Buffer.from(info.PublicKey)
      ],
      error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
};

export const openDb = (): any => {
  const db = DB.createConnection({
    host: process.env.ILS_DB_HOST || "ilsdb",
    port: process.env.ILS_DB_PORT || "3306",
    user: process.env.DB_USER || "development",
    password: "zaphod",
    database: process.env.DB_DATABASE || "development"
  });
  db.connect();

  return db;
};
