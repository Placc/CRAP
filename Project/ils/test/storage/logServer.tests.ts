import "mocha";
import { expect } from "chai";
import log from "loglevel";
import { ILSLogServer } from "../../src/storage/trillian/types/types";
import NewILSLogServer from "../../src/storage/trillian/server/logServer";
import initStorage from "../../src/storage/init/initTrillian";
import { deleteAllTrees } from "./util";
import { LogEntry, Operation } from "common/trillian/entry/entry_pb";
import { fromValue } from "long";
import {
  VerifyInclusionByHash,
  VerifyConsistencyProof
} from "common/trillian/verification/logVerifier";
import { BuildLogLeafForEntry } from "common/trillian/util";
import { emptyLogRoot } from "../test_data";
import { cloneDeep } from "lodash";
import { Proof } from "common/trillian/types";
import { stringify } from "common/util/funs";
import { parseProof } from "common/trillian/parse";
import { TreeType } from "common/participants/types";

describe("LogServer", () => {
  log.setLevel(log.levels.WARN, true);

  let logServer: ILSLogServer;

  const logEntry1 = new LogEntry();
  logEntry1.setDomain("test.com");
  logEntry1.setCert("certificate");
  logEntry1.setOperation(Operation.CREATE);
  const leaf1 = BuildLogLeafForEntry(logEntry1.serializeBinary());

  const logEntry2 = new LogEntry();
  logEntry2.setDomain("1.test.com");
  logEntry2.setCert("certificate2");
  logEntry2.setOperation(Operation.CREATE);
  const leaf2 = BuildLogLeafForEntry(logEntry2.serializeBinary());

  beforeEach(function(done) {
    this.timeout(60000);

    initStorage().then(trees => {
      logServer = NewILSLogServer(trees["0"].log);
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(60000);
    deleteAllTrees().then(_ => done());
  });

  describe("GetLeavesByRange", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSLogServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badServer
        .GetLeavesByRange({ start: "0", count: "0" })
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return nothing when no leaves exist", async function() {
      this.timeout(10000);

      const batchSize = "256";
      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: batchSize
      });

      expect(leaves).to.be.empty;
    });

    it("should return all added leaves from start index", async function() {
      this.timeout(120000);

      await logServer.AddLeaf(leaf1);

      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });

      expect(leaves).to.have.lengthOf(1);

      const value = LogEntry.deserializeBinary(
        leaves[0].getLeafValue() as Uint8Array
      );

      expect(value.getDomain()).to.equal("test.com");
      expect(value.getCert()).to.equal("certificate");
      expect(value.getOperation()).to.equal(Operation.CREATE);
    });
  });

  describe("constructor", () => {
    it("should fail on wrong tree type", () => {
      expect(() =>
        NewILSLogServer({
          ContentType: 0,
          PublicKey: new Uint8Array(0),
          TreeId: "0",
          TreeType: TreeType.MAP
        })
      ).to.throw("TreeType is not LOG!");
    });

    it("should set the attributes correctly", () => {
      const c = NewILSLogServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "treeId",
        TreeType: TreeType.LOG
      });

      expect(c.TreeInfo.TreeId).to.equal("treeId");
    });
  });

  describe("AddLeaf", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSLogServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badServer
        .AddLeaf(leaf1)
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should queue a leaf and wait for inclusion", async function() {
      this.timeout(60000);

      await logServer.AddLeaf(leaf1);

      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });

      expect(leaves).to.have.lengthOf(1);

      const value = LogEntry.deserializeBinary(
        leaves[0].getLeafValue() as Uint8Array
      );

      expect(value.getDomain()).to.equal("test.com");
      expect(value.getCert()).to.equal("certificate");
      expect(value.getOperation()).to.equal(Operation.CREATE);
    });
  });

  describe("GetRoot", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSLogServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badServer
        .GetRoot()
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return an empty root when no leaves exist", async function() {
      this.timeout(10000);

      const root = await logServer.GetRoot();

      expect(root.TreeSize).to.equal("0");
      expect(root.Revision).to.equal("0");
    });

    it("should return an updated root after AddLeaf", async function() {
      this.timeout(120000);

      const oldRoot = await logServer.GetRoot();

      await logServer.AddLeaf(leaf1);
      await logServer.AddLeaf(leaf2);

      const root = await logServer.GetRoot();

      expect(root.Revision).to.not.equal(oldRoot.Revision);
      expect(root.TreeSize).to.not.equal(oldRoot.TreeSize);
      expect(fromValue(root.TimestampNanos).gt(oldRoot.TimestampNanos)).to.be
        .true;
    });
  });

  describe("GetInclusionProof", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSLogServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badServer
        .GetInclusionProof(leaf1.getMerkleLeafHash_asU8())
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should throw if the given log is empty", function(done) {
      this.timeout(10000);

      logServer
        .GetInclusionProof(leaf1.getMerkleLeafHash_asU8())
        .then(_ => done(new Error()))
        .catch(e => done());
    });

    it("should throw an error if the given leaf does not exist", function(done) {
      this.timeout(60000);

      const newLeaf = BuildLogLeafForEntry(new Uint8Array([64]));
      logServer
        .AddLeaf(newLeaf)
        .then(() => logServer.GetInclusionProof(leaf1.getMerkleLeafHash_asU8()))
        .then(() => done(new Error(`Terminated unexpectedly`)))
        .catch(e => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return a valid proof list if a leaf has been added", async function() {
      this.timeout(120000);

      await logServer.AddLeaf(leaf1);
      await logServer.AddLeaf(leaf2);

      const root = await logServer.GetRoot();
      const proofs = await logServer.GetInclusionProof(
        leaf2.getMerkleLeafHash_asU8()
      );

      expect(proofs).to.not.be.undefined;
      expect(proofs!.length).to.be.greaterThan(0);

      for (const proof of proofs!) {
        VerifyInclusionByHash(
          root,
          leaf2.getMerkleLeafHash_asU8(),
          parseProof(stringify(proof.toObject()))
        );
      }
    });
  });

  describe("GetConsistencyProof", () => {
    it("should return an empty proof if the current root equals the given one", async function() {
      this.timeout(60000);

      const root = await logServer.AddLeaf(leaf1);

      const proof = await logServer.GetConsistencyProof(root);

      expect(proof.getHashesList()).to.be.empty;
    });

    it("should return an empty proof if the current root is empty", async function() {
      this.timeout(10000);

      const proof = await logServer.GetConsistencyProof(emptyLogRoot);

      expect(proof.getHashesList()).to.be.empty;
    });

    it("should return a valid proof after a leaf has been added", async function() {
      this.timeout(60000);

      const oldRoot = await logServer.GetRoot();

      const newLeaf = BuildLogLeafForEntry(new Uint8Array([64]));
      const newRoot = await logServer.AddLeaf(newLeaf);

      const proof = await logServer.GetConsistencyProof(newRoot);

      VerifyConsistencyProof(
        oldRoot.TreeSize,
        newRoot.TreeSize,
        oldRoot.RootHash,
        newRoot.RootHash,
        proof.getHashesList_asU8()
      );
    });
  });
});
