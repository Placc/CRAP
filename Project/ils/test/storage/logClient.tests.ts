/*import "mocha";
import { expect } from "chai";
import log from "loglevel";
import { ILSLogClient } from "../../src/storage/trillian/types/types";
import NewILSLogClient from "../../src/storage/trillian/client/logClient";
import initStorage from "../../src/storage/init/initTrillian";
import { deleteAllTrees } from "./util";
import { LogEntry, Operation } from "../../src/storage/trillian/entry/entry_pb";
import { fromValue } from "long";
import { VerifyInclusionByHash } from "../../src/storage/trillian/verification/logVerifier";
import { BuildLogLeafForEntry } from "../../src/storage/trillian/server/util";

describe("LogClient", () => {
  log.setLevel(log.levels.WARN, true);

  let logClient: ILSLogClient;

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
    this.timeout(10000);

    initStorage().then(trees => {
      logClient = NewILSLogClient(trees["0"].log);
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(20000);
    deleteAllTrees().then(_ => done());
  });

  describe("GetLeavesByRange", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badClient = NewILSLogClient({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badClient
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
      const leaves = await logClient.GetLeavesByRange({
        start: "0",
        count: batchSize
      });

      expect(leaves).to.be.empty;
    });

    it("should return all added leaves from start index", async function() {
      this.timeout(120000);

      await logClient.AddLeaf(leaf1);

      const leaves = await logClient.GetLeavesByRange({
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
        NewILSLogClient({
          ContentType: 0,
          PublicKey: new Uint8Array(0),
          TreeId: "0",
          TreeType: TreeType.MAP
        })
      ).to.throw("TreeType is not LOG!");
    });

    it("should set the attributes correctly", function() {
      const c = NewILSLogClient({
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

      const badClient = NewILSLogClient({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badClient
        .AddLeaf(leaf1)
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should queue a leaf and wait for inclusion", async function() {
      this.timeout(60000);

      await logClient.AddLeaf(leaf1);

      const leaves = await logClient.GetLeavesByRange({
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

      const badClient = NewILSLogClient({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badClient
        .GetRoot()
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return an empty root when no leaves exist", async function() {
      this.timeout(10000);

      const root = await logClient.GetRoot();

      expect(root.TreeSize).to.equal("0");
      expect(root.Revision).to.equal("0");
    });

    it("should return an updated root after AddLeaf", async function() {
      this.timeout(120000);

      const oldRoot = await logClient.GetRoot();

      await logClient.AddLeaf(leaf1);
      await logClient.AddLeaf(leaf2);

      const root = await logClient.GetRoot();

      expect(root.Revision).to.not.equal(oldRoot.Revision);
      expect(root.TreeSize).to.not.equal(oldRoot.TreeSize);
      expect(fromValue(root.TimestampNanos).gt(oldRoot.TimestampNanos)).to.be
        .true;
    });
  });

  describe("GetInclusionProof", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badClient = NewILSLogClient({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badClient
        .GetInclusionProof(leaf1.getMerkleLeafHash_asU8())
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should throw if the given log is empty", function(done) {
      this.timeout(10000);

      logClient
        .GetInclusionProof(leaf1.getMerkleLeafHash_asU8())
        .then(_ => done(new Error()))
        .catch(e => done());
    });

    it("should throw an error if the given leaf does not exist", function(done) {
      this.timeout(60000);

      const newLeaf = BuildLogLeafForEntry(new Uint8Array([64]));
      logClient
        .AddLeaf(newLeaf)
        .then(() => logClient.GetInclusionProof(leaf1.getMerkleLeafHash_asU8()))
        .then(() => done(new Error(`Terminated unexpectedly`)))
        .catch(e => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return a valid proof list if a leaf has been added", async function() {
      this.timeout(120000);

      await logClient.AddLeaf(leaf1);
      await logClient.AddLeaf(leaf2);

      const root = await logClient.GetRoot();
      const proofs = await logClient.GetInclusionProof(
        leaf2.getMerkleLeafHash_asU8()
      );

      expect(proofs).to.not.be.undefined;
      expect(proofs!.length).to.be.greaterThan(0);

      for (const proof of proofs!) {
        VerifyInclusionByHash(root, leaf2.getMerkleLeafHash_asU8(), proof);
      }
    });
  });

  describe("VerifyInclusion", () => {
    it("should fail if no log with given id exists", function(done) {
      this.timeout(5000);

      const badClient = NewILSLogClient({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.LOG
      });

      badClient
        .VerifyInclusion(leaf1)
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should throw if the given log is empty", function(done) {
      this.timeout(10000);

      logClient
        .VerifyInclusion(leaf1)
        .then(_ => done(new Error()))
        .catch(e => done());
    });

    it("should return false if the given leaf does not exist", async function() {
      this.timeout(60000);

      const newLeaf = BuildLogLeafForEntry(new Uint8Array([64]));
      await logClient.AddLeaf(newLeaf);

      const included = await logClient.VerifyInclusion(leaf1);

      expect(included).to.be.false;
    });

    it("should return true if a leaf has been added", async function() {
      this.timeout(120000);

      await logClient.AddLeaf(leaf1);
      await logClient.AddLeaf(leaf2);

      const included = await logClient.VerifyInclusion(leaf2);

      expect(included).to.be.true;
    });
  });
});
*/
