import "mocha";
import { expect } from "chai";
import { createHash } from "crypto";
import { MapLeaf } from "common/trillian/api/trillian_map_api_pb";
import { MapEntry } from "common/trillian/entry/entry_pb";
import log from "loglevel";
import initStorage from "../../src/storage/init/initTrillian";
import { ILSMapServer } from "../../src/storage/trillian/types/types";
import NewILSMapServer from "../../src/storage/trillian/server/mapServer";
import { deleteAllTrees } from "./util";
import { VerifyMapLeafInclusionHash } from "common/trillian/verification/mapVerifier";
import { emptyLogRoot } from "../test_data";
import { MapLeafInclusion } from "common/trillian/types";
import { stringify } from "common/util/funs";
import { parseMapLeafInclusion } from "common/trillian/parse";
import { TreeType } from "common/participants/types";
import { CreateMapIndex } from "common/trillian/util";

describe("MapServer", () => {
  log.setLevel(log.levels.WARN, true);

  let mapServer: ILSMapServer;

  const mapEntry1 = new MapEntry();
  mapEntry1.setCert("certificate1");
  mapEntry1.setDomain("1.test.com");

  const index1 = createHash("sha256")
    .update("1.test.com")
    .digest("base64");
  const leaf1 = new MapLeaf();
  leaf1.setIndex(index1);
  leaf1.setLeafValue(mapEntry1.serializeBinary());

  const mapEntry2 = new MapEntry();
  mapEntry2.setCert("certificate2");
  mapEntry2.setDomain("2.test.com");

  const index2 = createHash("sha256")
    .update("2.test.com")
    .digest("base64");
  const leaf2 = new MapLeaf();
  leaf2.setIndex(index2);
  leaf2.setLeafValue(mapEntry2.serializeBinary());

  beforeEach(function(done) {
    this.timeout(10000);

    initStorage().then(trees => {
      mapServer = NewILSMapServer(trees["0"].map);
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(10000);
    deleteAllTrees().then(_ => done());
  });

  describe("constructor", () => {
    it("should fail on wrong tree type", () => {
      expect(() =>
        NewILSMapServer({
          ContentType: 0,
          PublicKey: new Uint8Array(0),
          TreeId: "0",
          TreeType: TreeType.LOG
        })
      ).to.throw("TreeType is not MAP!");
    });

    it("should set attributes correctly", () => {
      const c = NewILSMapServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "treeId",
        TreeType: TreeType.MAP
      });

      expect(c.TreeInfo.TreeId).to.equal("treeId");
    });
  });

  describe("GetMapRoot", () => {
    it("should fail if no map with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSMapServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.MAP
      });

      badServer
        .GetMapRoot()
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return revision 0 root on an empty tree", async function() {
      this.timeout(10000);

      const mapRoot = await mapServer.GetMapRoot();

      expect(mapRoot.Revision).to.equal("0");
    });

    it("should return an updated map root after map mutation", async function() {
      this.timeout(20000);

      const mapRoot = await mapServer.GetMapRoot();

      const updatedRoot = await mapServer.SetLeaves([leaf1], emptyLogRoot);

      expect(updatedRoot).to.not.equal(mapRoot);
      expect(updatedRoot).to.have.property("Revision", "1");
    });
  });

  describe("GetMapLeaves", () => {
    it("should fail if no map with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSMapServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.MAP
      });

      badServer
        .GetMapLeaves([])
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should return an empty leaf if the given index does not exist", async function() {
      this.timeout(10000);

      const root = await mapServer.GetMapRoot();

      const index = createHash("sha256")
        .update("999")
        .digest("base64");

      const inclusions = await mapServer.GetMapLeaves([index]);
      expect(inclusions).to.have.lengthOf(1);

      const mapLeaf = inclusions[0].getLeaf()!;
      expect(mapLeaf.getLeafValue()).to.equal("");

      for (const inclusion of inclusions) {
        await VerifyMapLeafInclusionHash(
          mapServer.TreeInfo.TreeId,
          root.RootHash,
          parseMapLeafInclusion(stringify(inclusion.toObject()))
        );
      }
    });

    it("should return all existing  with proof", async function() {
      this.timeout(20000);

      await mapServer.SetLeaves([leaf1, leaf2], emptyLogRoot);

      const root = await mapServer.GetMapRoot();

      const index1 = CreateMapIndex("1.test.com");
      const index2 = CreateMapIndex("2.test.com");

      const inclusions = await mapServer.GetMapLeaves([index1, index2]);
      const mapLeaves = inclusions.map(
        incl => incl.getLeaf()!.getLeafValue() as Uint8Array
      );

      expect(mapLeaves).to.have.lengthOf(2);

      const value1 = MapEntry.deserializeBinary(mapLeaves[0]);

      expect(value1.getCert()).to.equal("certificate1");
      expect(value1.getDomain()).to.equal("1.test.com");

      const value2 = MapEntry.deserializeBinary(mapLeaves[1]);

      expect(value2.getCert()).to.equal("certificate2");
      expect(value2.getDomain()).to.equal("2.test.com");

      for (const inclusion of inclusions) {
        await VerifyMapLeafInclusionHash(
          mapServer.TreeInfo.TreeId,
          root.RootHash,
          parseMapLeafInclusion(stringify(inclusion.toObject()))
        );
      }
    });
  });

  describe("SetLeaves", () => {
    it("should fail if no map with given id exists", function(done) {
      this.timeout(5000);

      const badServer = NewILSMapServer({
        ContentType: 0,
        PublicKey: new Uint8Array(0),
        TreeId: "-1",
        TreeType: TreeType.MAP
      });

      badServer
        .SetLeaves([], emptyLogRoot)
        .then(_ => done(new Error()))
        .catch((e: Error) => {
          expect(e.message).to.contain("NOT_FOUND");
          done();
        });
    });

    it("should insert all given leaves", () => {
      //This is already tested by "GetAndVerifyMapLeaves"
    });

    it("should update the map root after insertion", async function() {
      this.timeout(10000);

      const oldRoot = await mapServer.GetMapRoot();

      const newRoot = await mapServer.SetLeaves([leaf1, leaf2], emptyLogRoot);

      expect(Number.parseInt(newRoot.Revision)).to.be.greaterThan(
        Number.parseInt(oldRoot.Revision)
      );
      expect(newRoot.RootHash).to.not.equal(oldRoot.RootHash);
    });
  });
});
