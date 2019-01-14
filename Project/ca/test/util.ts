import { createStubInstance } from "sinon";
import { TreeRootDatabase } from "../src/db";
import { createRequestHolder } from "../src/requests/requestHolder";

const TREE_DB_ENTRIES = new Map();

export const testTreeDB = () => {
  const db = createStubInstance(TreeRootDatabase);
  db.get.callsFake((ils, typ) => {
    if (TREE_DB_ENTRIES.has(ils.url))
      return Promise.resolve(TREE_DB_ENTRIES.get(ils.url));
    else Promise.reject("test-util test-tree-db");
  });
  db.set.callsFake((ils, typ, root) => {
    TREE_DB_ENTRIES.set(ils.url, root);
    return Promise.resolve();
  });
  db.exists.callsFake((ils, typ) =>
    Promise.resolve(TREE_DB_ENTRIES.has(ils.url))
  );
  return db;
};

export const TEST_REQUEST_HOLDER = createRequestHolder();
