import { createStubInstance } from "sinon";
import { TreeRootDatabase } from "../../src/db";
import { Server } from "common/communication/types";
import { PRIVATE_KEY, PUBLIC_KEY } from "../test_data";
import { stringify } from "common/util/funs";
import * as DB from "mysql";

const TREE_DB_ENTRIES = new Map();

export const testServer: Server = {
  privateKey: PRIVATE_KEY,
  publicKey: PUBLIC_KEY,
  staticKeys: new Map(),
  url: "monitor.com"
};

export const deleteAllTrees = () => {
  const db = DB.createConnection({
    host: process.env.CA_DB_HOST || "monitordb",
    port: process.env.CA_DB_PORT || "3306",
    user: process.env.DB_USER || "development",
    password: "zaphod",
    database: process.env.DB_DATABASE || "test"
  });
  db.connect();

  return new Promise<void>((resolve, reject) => {
    db.query("DELETE FROM TreeRoots", error => {
      db.end();
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
