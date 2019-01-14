import "mocha";
import { expect } from "chai";
import {
  ILSLogServer,
  ILSMapServer
} from "../../src/storage/trillian/types/types";
import { testLogServer, testMapServer } from "./util";
import {
  LogEntry,
  Operation,
  MapEntry
} from "common/trillian/entry/entry_pb";
import { PublisherStorage } from "../../src/storage/PublisherStorage";
import { cloneDeep } from "lodash";
import { MapLeaf } from "common/trillian/api/trillian_map_api_pb";
import { createHash } from "crypto";
import { publisherCert1, publisherCert2, emptyLogRoot } from "../test_data";
import { stringify } from "common/util/funs";
import { ContentType } from "common/participants/types";
import { CreateMapIndex } from "common/trillian/util";

describe("PublisherStorage", () => {
  let logServer: ILSLogServer;
  let mapServer: ILSMapServer;

  beforeEach(() => {
    mapServer = testMapServer(ContentType.PUBLISHER_CERTIFICATE);
    logServer = testLogServer(ContentType.PUBLISHER_CERTIFICATE);
  });

  describe("constructor", () => {
    it("should throw if log or map content type is not PUBLISHER_CERTIFICATE", () => {
      const wrongLogClient = cloneDeep(logServer);
      wrongLogClient.TreeInfo.ContentType = ContentType.APPLICATION_CERTIFICATE;

      expect(() => new PublisherStorage(wrongLogClient, mapServer)).to.throw;
    });
  });

  describe("create", () => {
    it("should create an INSERT entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const storage = new PublisherStorage(logServer, mapServer);

      await storage.create(publisherCert1);

      const logLeaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });
      expect(logLeaves.length).to.equal(1);

      const logEntry = LogEntry.deserializeBinary(
        logLeaves[0].getLeafValue_asU8()
      );
      expect(logEntry.getDomain()).to.equal("publisher");
      expect(logEntry.getCert()).to.equal(stringify(publisherCert1));
      expect(logEntry.getOperation()).to.equal(Operation.CREATE);

      const mapIndex = CreateMapIndex("publisher");
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal("publisher");
      expect(mapEntry.getCert()).to.equal(stringify(publisherCert1));
    });

    it("should fail if a certificate already exists", function(done) {
      this.timeout(5000);

      const mapEntry = new MapEntry();
      mapEntry.setCert(stringify(publisherCert1));
      mapEntry.setDomain(publisherCert2.subject);
      const index = CreateMapIndex(publisherCert2.subject);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(mapEntry.serializeBinary());

      mapServer
        .SetLeaves([leaf], emptyLogRoot)
        .then(() =>
          new PublisherStorage(logServer, mapServer).create(publisherCert2)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has already a registered certificate!");
          done();
        });
    });
  });

  describe("update", () => {
    it("should create an UPDATE entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const storage = new PublisherStorage(logServer, mapServer);
      await storage.create(publisherCert1);

      const oldMapEntry = new MapEntry();
      oldMapEntry.setCert(stringify(publisherCert1));
      oldMapEntry.setDomain(publisherCert1.subject);
      const index = CreateMapIndex(publisherCert1.subject);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(oldMapEntry.serializeBinary());

      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const pCert2 = cloneDeep(publisherCert2);
      pCert2.subject = publisherCert1.subject;

      await storage.update(pCert2);

      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });

      expect(leaves.length).to.equal(2);

      const entry = LogEntry.deserializeBinary(leaves[1].getLeafValue_asU8());
      expect(entry.getDomain()).to.equal(pCert2.subject);
      expect(entry.getCert()).to.equal(stringify(pCert2));
      expect(entry.getOperation()).to.equal(Operation.UPDATE);

      const mapIndex = CreateMapIndex(pCert2.subject);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal(pCert2.subject);
      expect(mapEntry.getCert()).to.equal(stringify(pCert2));
    });

    it("should fail if no old certificate exists in the map", function(done) {
      this.timeout(5000);

      const storage = new PublisherStorage(logServer, mapServer);
      storage
        .update(publisherCert2)
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has no registered certificate!");
          done();
        });
    });
  });

  describe("exists", () => {
    it("should return false if the given cert doesn't exist in the map", async function() {
      this.timeout(5000);

      const res = await new PublisherStorage(logServer, mapServer).exists(
        publisherCert1.subject
      );

      expect(res).to.be.false;
    });

    it("should return true if the given cert exists in the map", async function() {
      this.timeout(5000);

      const entry = new MapEntry();
      entry.setCert(stringify(publisherCert1));
      entry.setDomain(publisherCert1.subject);
      const index = CreateMapIndex(publisherCert1.subject);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const res = await new PublisherStorage(logServer, mapServer).exists(
        publisherCert1.subject
      );

      expect(res).to.be.true;
    });
  });

  describe("getVerifiable", () => {
    it("should return a proof of absence if no cert for the given subject exists in the map", async function() {
      this.timeout(5000);

      const inclusion = await new PublisherStorage(
        logServer,
        mapServer
      ).getVerifiable("publisher");

      expect(inclusion.cert).to.be.undefined;
    });

    it("should return the included certificate for a leaf in the map", async function() {
      this.timeout(5000);

      const entry = new MapEntry();
      entry.setCert(stringify(publisherCert1));
      entry.setDomain(publisherCert1.subject);
      const index = CreateMapIndex(publisherCert1.subject);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const inclusionProof = await new PublisherStorage(
        logServer,
        mapServer
      ).getVerifiable(publisherCert1.subject);

      expect(inclusionProof.cert).to.deep.equal(publisherCert1);
    });
  });
});
