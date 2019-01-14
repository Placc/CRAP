import "mocha";
import { expect } from "chai";
import {
  deserializeMapRoot,
  deserializeLogRoot
} from "../../src/storage/trillian/types/deserialize";
import NewILSMapServer from "../../src/storage/trillian/server/mapServer";
import NewILSLogServer from "../../src/storage/trillian/server/logServer";
import initStorage from "../../src/storage/init/initTrillian";
import log from "loglevel";
import { deleteAllTrees } from "./util";
import {
  SignedMapRoot,
  SignedLogRoot
} from "common/trillian/api/trillian_pb";

describe("Deserialize", () => {
  log.setLevel(log.levels.WARN, true);

  afterEach(function(done) {
    this.timeout(20000);
    deleteAllTrees().then(_ => done());
  });

  describe("deserializeMapRoot", () => {
    it("should fail if the given array is malformed", function(done) {
      this.timeout(5000);

      const root = new SignedMapRoot();
      root.setMapRoot(new Uint8Array(0));

      deserializeMapRoot(root)
        .then(_ => done(new Error()))
        .catch(_ => done());
    });

    it("should return a JSON representation of the TLS-serialized map root", async function() {
      this.timeout(10000);

      const trees = await initStorage();
      const mapServer = NewILSMapServer(trees["0"].map);

      const mapRoot = await mapServer.GetMapRoot();

      expect(mapRoot).to.have.property("LogRoot");
      expect(mapRoot).to.have.property("Signature");
      expect(mapRoot).to.have.property("Revision", "0");
      expect(mapRoot).to.have.property("TimestampNanos");
      expect(mapRoot).to.have.property("RootHash");
    });
  });

  describe("deserializeLogRoot", () => {
    it("should fail if the given array is malformed", function(done) {
      this.timeout(5000);

      const root = new SignedLogRoot();
      root.setLogRoot(new Uint8Array(0));

      deserializeLogRoot(root)
        .then(_ => done(new Error()))
        .catch(_ => done());
    });

    it("should return a JSON representation of the TLS-serialized log root", async function() {
      this.timeout(10000);

      const trees = await initStorage();
      const logServer = NewILSLogServer(trees["0"].log);

      const logRoot = await logServer.GetRoot();

      expect(logRoot).to.have.property("Metadata");
      expect(logRoot).to.have.property("Revision", "0");
      expect(logRoot).to.have.property("TimestampNanos");
      expect(logRoot).to.have.property("RootHash");
      expect(logRoot).to.have.property("Signature");
      expect(logRoot).to.have.property("TreeSize", "0");
    });
  });
});
