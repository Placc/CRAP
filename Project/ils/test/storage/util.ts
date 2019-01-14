import { TrillianAdminClient } from "common/trillian/api/trillian_admin_api_grpc_pb";
import * as grpc from "grpc";
import {
  openDb,
  getExistingTrees,
  queryDbTrees,
  deleteTree,
  deleteDbTree
} from "../../src/storage/init/adminFuns";
import { TreeInfos } from "../../src/storage/types";
import { TrillianMapClient } from "common/trillian/api/trillian_map_api_grpc_pb";
import { TrillianLogClient } from "common/trillian/api/trillian_log_api_grpc_pb";
import {
  LogLeaf,
  Proof
} from "common/trillian/api/trillian_log_api_pb";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import {
  ILSMapServer,
  LogRange,
  ILSLogServer
} from "../../src/storage/trillian/types/types";
import { LogRootV1, MapRootV1 } from "common/trillian/types";
import { isNil, cloneDeep } from "lodash";
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { createHash } from "crypto";
import { PublisherStorage } from "../../src/storage/PublisherStorage";
import {
  ARPKICert,
  PublisherCertificate,
  ApplicationCertificate,
  AuditionCertificate,
  MultiSignature
} from "common/certs/types";
import { ApplicationStorage } from "../../src/storage/ApplicationStorage";
import {
  emptyLogRoot,
  applicationCert1,
  applicationCert2,
  PRIVATE_KEY
} from "../test_data";
import { AuditionStorage } from "../../src/storage/AuditionStorage";
import { sign } from "common/crypto/rsa";
import {
  TreeType,
  ContentType,
  TreeInfo
} from "common/participants/types";

const MapServer = process.env.MAP_SERVER || "trillian-map-server:8093";
const LogServer = process.env.LOG_SERVER || "trillian-log-server:8090";

export const createClients = () => {
  const credentials = grpc.credentials.createInsecure();
  const adminClient = new TrillianAdminClient(MapServer, credentials);
  const mapServer = new TrillianMapClient(MapServer, credentials);
  const logServer = new TrillianLogClient(LogServer, credentials);

  return {
    adminClient,
    mapServer,
    logServer
  };
};

export const deleteAllTrees = async () => {
  //Both servers point to the same db
  const adminClient = new TrillianAdminClient(
    MapServer,
    grpc.credentials.createInsecure()
  );
  const db = openDb();

  const existingTrees = await getExistingTrees(adminClient);
  const dbTrees = await queryDbTrees(db);

  for (const tree of existingTrees) {
    await deleteTree(tree.getTreeId(), adminClient);
  }
  for (const dbTree of dbTrees) {
    await deleteDbTree(dbTree.TreeId, db);
  }

  db.end();
  adminClient.close();
};

export const doTreesExist = async (trees: TreeInfos) => {
  //Both servers point to the same db
  const adminClient = new TrillianAdminClient(
    MapServer,
    grpc.credentials.createInsecure()
  );
  const db = openDb();

  const existingTrees = await getExistingTrees(adminClient);
  const dbTrees = await queryDbTrees(db);

  const logs = [...Object.keys(trees).map(key => trees[key].log)];
  for (const log of logs) {
    const tree = existingTrees.find(
      tree =>
        !tree.getDeleted() &&
        tree.getTreeId() == log.TreeId &&
        tree.getTreeType() == TreeType.LOG
    );
    const dbTree = dbTrees.find(
      tree =>
        tree.TreeType == log.TreeType &&
        tree.TreeId == log.TreeId &&
        tree.ContentType == log.ContentType
    );

    if (!tree || !dbTree) {
      console.log(`Log: ${log}`);
      console.log(`Existing Tree: ${tree}`);
      console.log(`Existing db: ${dbTree}`);
      return false;
    }
  }
  const maps = [...Object.keys(trees).map(key => trees[key].map)];
  for (const map of maps) {
    const tree = existingTrees.find(
      tree =>
        !tree.getDeleted() &&
        tree.getTreeId() == map.TreeId &&
        tree.getTreeType() == TreeType.MAP
    );
    const dbTree = dbTrees.find(
      tree =>
        tree.TreeType == map.TreeType &&
        tree.TreeId == map.TreeId &&
        tree.ContentType == map.ContentType
    );

    if (!tree || !dbTree) {
      console.log(`Map: ${map}`);
      console.log(`Existing Tree: ${tree}`);
      console.log(`Existing db: ${dbTree}`);
      return false;
    }
  }

  db.end();
  adminClient.close();

  return true;
};

export function almostEqual(infos1: TreeInfos, infos2: TreeInfos) {
  const logs1 = [...Object.keys(infos1).map(key => infos1[key].log)];
  const logs2 = [...Object.keys(infos2).map(key => infos2[key].log)];
  const logEqual = logs1.every(log1 =>
    logs2.some(
      log2 =>
        log1.ContentType == log2.ContentType &&
        log1.TreeId == log2.TreeId &&
        log1.TreeType == log2.TreeType
    )
  );
  const maps1 = [...Object.keys(infos1).map(key => infos1[key].map)];
  const maps2 = [...Object.keys(infos2).map(key => infos2[key].map)];
  const mapEqual = maps1.every(map1 =>
    maps2.some(
      map2 =>
        map1.ContentType == map2.ContentType &&
        map1.TreeId == map2.TreeId &&
        map1.TreeType == map2.TreeType
    )
  );
  return logEqual && mapEqual;
}

export const testMapServer = (contentType: ContentType): ILSMapServer => {
  const lMap = new Map<string, MapLeaf>();

  const mapRoot: MapRootV1 = {
    LogRoot: emptyLogRoot,
    Revision: "0",
    RootHash: new Uint8Array([0]),
    Signature: new Uint8Array([0]),
    TimestampNanos: "0"
  };

  const getLeaves = (list: string[]): Promise<MapLeafInclusion[]> => {
    const inclusions = list.map(idx => {
      const leaf = [...lMap.values()].find(val => idx == val.getIndex());
      const incl = new MapLeafInclusion();
      incl.setLeaf(leaf);
      incl.setInclusionList([new Uint8Array([0])]);
      return incl;
    });

    return Promise.resolve(inclusions);
  };

  const setLeaves = (
    leaves: MapLeaf[],
    logRoot: LogRootV1
  ): Promise<MapRootV1> => {
    leaves.forEach(leaf => {
      lMap.set(leaf.getIndex() as string, leaf);
    });

    mapRoot.LogRoot = logRoot;
    mapRoot.Revision = `${parseInt(mapRoot.Revision) + 1}`;

    return Promise.resolve(mapRoot);
  };

  return {
    GetMapLeaves: getLeaves,
    GetMapRoot: () => Promise.resolve(cloneDeep(mapRoot)),
    SetLeaves: setLeaves,
    TreeInfo: createInfos(TreeType.MAP, contentType)[0]
  };
};

export const testLogServer = (contentType: ContentType): ILSLogServer => {
  const leaves = new Array<LogLeaf>();
  const root: LogRootV1 = {
    Metadata: new Uint8Array(0),
    Revision: "0",
    RootHash: new Uint8Array([0]),
    Signature: new Uint8Array([0]),
    TimestampNanos: "0",
    TreeSize: "0"
  };

  const addLeaf = (leaf: LogLeaf): Promise<LogRootV1> => {
    leaf.setLeafIndex(`${leaves.length}`);
    const timestamp = new Timestamp();
    timestamp.setSeconds(Date.now() / 1000);
    timestamp.setNanos(0);
    leaf.setIntegrateTimestamp(timestamp);
    leaves.push(leaf);
    root.TreeSize = `${parseInt(root.TreeSize) + 1}`;
    root.Revision = `${parseInt(root.Revision) + 1}`;
    return Promise.resolve(root);
  };

  const getInclusionProof = (hash: Uint8Array): Promise<Proof[]> => {
    return Promise.resolve([]);
  };

  const verifyInclusion = (leaf: LogLeaf): Promise<boolean> => {
    return Promise.resolve(
      !isNil(getInclusionProof(leaf.getMerkleLeafHash_asU8()))
    );
  };

  const getConsistencyProof = (root: LogRootV1): Promise<Proof> => {
    return Promise.resolve(new Proof());
  };

  const getLeaves = (range: LogRange): Promise<LogLeaf[]> => {
    const start = parseInt(range.start);
    const end = Math.max(parseInt(range.count) + start, leaves.length);
    const elems = leaves.slice(start, end);
    return Promise.resolve(elems);
  };

  return {
    AddLeaf: addLeaf,
    GetInclusionProof: getInclusionProof,
    GetLeavesByRange: getLeaves,
    GetRoot: () => Promise.resolve(cloneDeep(root)),
    TreeInfo: createInfos(TreeType.LOG, contentType)[0],
    GetConsistencyProof: getConsistencyProof
  };
};

export const createInfos = (
  typ: TreeType,
  ...contentTypes: number[]
): TreeInfo[] => {
  return contentTypes.map((contentType, idx) => {
    return {
      ContentType: contentType,
      TreeType: typ,
      TreeId: `${idx}`,
      PublicKey: new Uint8Array(0)
    };
  });
};

export const testPublisherStorage = async (
  ...certs: ARPKICert<PublisherCertificate>[]
): Promise<PublisherStorage> => {
  const logServer = testLogServer(ContentType.PUBLISHER_CERTIFICATE);
  const mapServer = testMapServer(ContentType.PUBLISHER_CERTIFICATE);
  const storage = new PublisherStorage(logServer, mapServer);

  for (const cert of certs) {
    try {
      await storage.create(cert);
    } catch {
      continue;
    }
  }

  return storage;
};

export const testApplicationStorage = async (
  ...certs: ARPKICert<ApplicationCertificate>[]
): Promise<{
  application: ApplicationStorage;
  publisher: PublisherStorage;
}> => {
  const pubCerts = certs.map(cert => {
    const { acceptanceConfirmation, ...pubCert } = cert.publisher;
    return pubCert;
  });
  const pubStorage = await testPublisherStorage(...pubCerts);

  const logServer = testLogServer(ContentType.APPLICATION_CERTIFICATE);
  const mapServer = testMapServer(ContentType.APPLICATION_CERTIFICATE);

  const storage = new ApplicationStorage(logServer, mapServer, pubStorage);

  for (const cert of certs) {
    try {
      await storage.create(cert);
    } catch {
      continue;
    }
  }

  return {
    application: storage,
    publisher: pubStorage
  };
};

export const testAuditionStorage = async (
  ...certs: ARPKICert<AuditionCertificate>[]
): Promise<{
  application: ApplicationStorage;
  publisher: PublisherStorage;
  audition: AuditionStorage;
}> => {
  const appCerts = certs.map(cert => {
    if (cert.application == applicationCert1.applicationUrl)
      return applicationCert1;
    return applicationCert2;
  });
  const { application, publisher } = await testApplicationStorage(...appCerts);

  certs.forEach(cert => {
    const { acceptanceConfirmation, ...pubCert } = cert.auditor;
    try {
      publisher.create(pubCert);
    } catch {}
  });

  const logServer = testLogServer(ContentType.AUDIT_CERTIFICATE);
  const mapServer = testMapServer(ContentType.AUDIT_CERTIFICATE);

  const storage = new AuditionStorage(
    logServer,
    mapServer,
    publisher,
    application
  );

  for (const cert of certs) {
    try {
      await storage.create(cert);
    } catch {
      continue;
    }
  }

  return {
    publisher,
    application,
    audition: storage
  };
};
