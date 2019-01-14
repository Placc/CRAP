import { TrillianMapClient } from "common/trillian/api/trillian_map_api_grpc_pb";
import { TrillianLogClient } from "common/trillian/api/trillian_log_api_grpc_pb";
import * as grpc from "grpc";
import { TrillianAdminClient } from "common/trillian/api/trillian_admin_api_grpc_pb";
import { isNil } from "lodash";
import { TreeInfos } from "../types";
import {
  deleteDbTree,
  createTree,
  deleteTree,
  getExistingTrees,
  initLog,
  initMap,
  insertDbTree,
  openDb,
  queryDbTrees
} from "./adminFuns";
import log from "loglevel";
import { ContentType, TreeType } from "common/participants/types";

export default async (): Promise<TreeInfos> => {
  log.debug("Initializing Storage...");

  const MapServer = process.env.MAP_SERVER || "trillian-map-server:8093";
  const LogServer = process.env.LOG_SERVER || "trillian-log-server:8090";

  const credentials = grpc.credentials.createInsecure();

  const mapAdminClient = new TrillianAdminClient(MapServer, credentials);
  const logAdminClient = new TrillianAdminClient(LogServer, credentials);

  const mapClient = new TrillianMapClient(MapServer, credentials);
  const logClient = new TrillianLogClient(LogServer, credentials);

  const db = openDb();

  const treeInfos = await queryDbTrees(db);
  //Same database behind, use any server
  const existingTrees = await getExistingTrees(logAdminClient);

  const existingLogs = existingTrees.filter(
    tree =>
      !tree.getDeleted() &&
      tree.getTreeType() === TreeType.LOG &&
      !isNil(
        treeInfos.find(
          info =>
            info.TreeId === tree.getTreeId() && info.TreeType == TreeType.LOG
        )
      )
  );
  const existingMaps = existingTrees.filter(
    tree =>
      !tree.getDeleted() &&
      tree.getTreeType() === TreeType.MAP &&
      !isNil(
        treeInfos.find(
          info =>
            info.TreeId === tree.getTreeId() && info.TreeType == TreeType.MAP
        )
      )
  );

  const ids = {};

  for (const cType in ContentType) {
    if (isNaN(Number(cType))) {
      continue;
    }
    const logType = Number(cType);
    const existingInfo = treeInfos.find(
      info => info.TreeType == TreeType.LOG && info.ContentType == logType
    );

    if (
      existingInfo &&
      existingLogs.find(tree => tree.getTreeId() === existingInfo.TreeId)
    ) {
      ids[logType] = {
        log: existingInfo
      };
    } else {
      const tree = await createTree(TreeType.LOG, logAdminClient);
      await initLog(tree.getTreeId(), logClient);

      const info = {
        TreeId: tree.getTreeId(),
        TreeType: TreeType.LOG,
        ContentType: logType,
        PublicKey: tree.getPublicKey()!.getDer() as Uint8Array
      };
      await insertDbTree(info, db);

      log.debug(`Created Log ${tree.getTreeId()}.`);

      ids[logType] = {
        log: info
      };
    }
  }

  for (const cType in ContentType) {
    if (isNaN(Number(cType))) {
      continue;
    }
    const mapType = Number(cType);
    const existingInfo = treeInfos.find(
      info => info.TreeType == TreeType.MAP && info.ContentType == mapType
    );

    if (
      existingInfo &&
      existingMaps.find(tree => tree.getTreeId() === existingInfo.TreeId)
    ) {
      ids[mapType].map = existingInfo;
    } else {
      const tree = await createTree(TreeType.MAP, mapAdminClient);
      await initMap(tree.getTreeId(), mapClient);

      const info = {
        TreeId: tree.getTreeId(),
        TreeType: TreeType.MAP,
        ContentType: mapType,
        PublicKey: tree.getPublicKey()!.getDer() as Uint8Array
      };
      await insertDbTree(info, db);

      log.debug(`Created Map ${tree.getTreeId()}.`);

      ids[mapType].map = info;
    }
  }

  const usedIds = Object.keys(ids)
    .map(key => ids[key].log.TreeId)
    .concat(Object.keys(ids).map(key => ids[key].map.TreeId));
  const unusedTrees = existingTrees.filter(tree =>
    isNil(usedIds.find(used => used === tree.getTreeId()))
  );
  const unusedInfos = treeInfos.filter(info =>
    isNil(usedIds.find(used => used === info.TreeId))
  );

  await Promise.all(
    unusedTrees
      .map(async tree => await deleteTree(tree.getTreeId(), logAdminClient))
      .concat(
        unusedInfos.map(async info => await deleteDbTree(info.TreeId, db))
      )
  );

  const stillExistingTrees = await getExistingTrees(logAdminClient);
  const stillExistingInfos = await queryDbTrees(db);
  const isTreesDeleted = !stillExistingTrees.some(
    tree =>
      !tree.getDeleted() &&
      unusedTrees.length > 0 &&
      !isNil(
        unusedTrees.find(unused => unused.getTreeId() === tree.getTreeId())
      )
  );
  const isInfosDeleted = !stillExistingInfos.some(
    info =>
      unusedInfos.length > 0 &&
      !isNil(unusedInfos.find(unused => unused === info))
  );

  if (!isTreesDeleted || !isInfosDeleted) {
    log.warn("Some unused trees/infos could not be deleted!");
  }

  db.end();
  logAdminClient.close();
  mapAdminClient.close();
  mapClient.close();
  logClient.close();

  log.debug("Storage initialized.");

  return ids as TreeInfos;
};
