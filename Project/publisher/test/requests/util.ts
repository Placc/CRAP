import { createStubInstance } from "sinon";
import { CertDatabase } from "../../src/db";

const TREE_DB_ENTRIES = new Map();
let PUB_CERT: any = undefined;

export const testCertDatabase = () => {
  const db = createStubInstance(CertDatabase);
  db.getPublisherCert.callsFake(() => Promise.resolve(PUB_CERT));
  db.setPublisherCert.callsFake(cert => {
    PUB_CERT = cert;
    return Promise.resolve();
  });
  db.latestVersion.callsFake(() => {
    if (PUB_CERT == null || PUB_CERT == undefined) return Promise.resolve(0);
    else return PUB_CERT.version;
  });
  db.exists.callsFake((url, v) => Promise.resolve(TREE_DB_ENTRIES.has(url)));
  db.setAppCert.callsFake((url, cert) => {
    TREE_DB_ENTRIES.set(url, cert);
    return Promise.resolve();
  });
  db.getAppCert.callsFake((url, v) =>
    Promise.resolve(TREE_DB_ENTRIES.get(url))
  );

  return {
    db,
    clear: () => {
      TREE_DB_ENTRIES.clear();
      PUB_CERT = undefined;
    }
  };
};
