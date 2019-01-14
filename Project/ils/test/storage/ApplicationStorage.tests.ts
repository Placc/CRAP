import "mocha";
import { expect } from "chai";
import {
  ILSLogServer,
  ILSMapServer
} from "../../src/storage/trillian/types/types";
import { testLogServer, testMapServer, testPublisherStorage } from "./util";
import { LogEntry, Operation, MapEntry } from "common/trillian/entry/entry_pb";
import { cloneDeep } from "lodash";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import { createHash } from "crypto";
import { ApplicationStorage } from "../../src/storage/ApplicationStorage";
import {
  applicationCert1,
  publisherCert1,
  publisherCert2,
  applicationCert2,
  emptyLogRoot,
  PRIVATE_KEY
} from "../test_data";
import { getHash } from "common/util/funs";
import { stringify } from "common/util/funs";
import { ContentType } from "common/participants/types";
import { CreateMapIndex } from "common/trillian/util";
import { sign } from "common/crypto/rsa";

describe("ApplicationStorage", () => {
  let logServer: ILSLogServer;
  let mapServer: ILSMapServer;

  beforeEach(() => {
    mapServer = testMapServer(ContentType.APPLICATION_CERTIFICATE);
    logServer = testLogServer(ContentType.APPLICATION_CERTIFICATE);
  });

  describe("constructor", () => {
    it("should throw if log or map content type is not APPLICATION_CERTIFICATE", function(done) {
      this.timeout(5000);

      testPublisherStorage().then(storage => {
        const wrongLogClient = cloneDeep(logServer);
        wrongLogClient.TreeInfo.ContentType = ContentType.AUDIT_CERTIFICATE;
        expect(() => new ApplicationStorage(wrongLogClient, mapServer, storage))
          .to.throw;
        done();
      });
    });
  });

  describe("create", () => {
    it("should create an INSERT entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const storage = new ApplicationStorage(
        logServer,
        mapServer,
        await testPublisherStorage(publisherCert1)
      );

      await storage.create(applicationCert1);

      const logLeaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });
      expect(logLeaves.length).to.equal(1);

      const logEntry = LogEntry.deserializeBinary(
        logLeaves[0].getLeafValue_asU8()
      );
      expect(logEntry.getDomain()).to.equal("url");
      const logCert = JSON.parse(logEntry.getCert());
      expect(logCert).to.deep.equal(applicationCert1);
      expect(logEntry.getOperation()).to.equal(Operation.CREATE);

      const mapIndex = CreateMapIndex("url");
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal("url");
      const cert = JSON.parse(mapEntry.getCert());
      expect(cert).to.deep.equal(applicationCert1);
    });

    it("should fail if a certificate already exists", function(done) {
      this.timeout(5000);

      const { publisher, ...rawCert } = applicationCert1;
      const json = stringify({
        publisher: publisher.subject,
        ...rawCert
      });

      const mapEntry = new MapEntry();
      mapEntry.setCert(json);
      mapEntry.setDomain(applicationCert1.applicationUrl);
      const index = CreateMapIndex(applicationCert1.applicationUrl);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(mapEntry.serializeBinary());

      const fakeCert = cloneDeep(applicationCert2);
      fakeCert.applicationUrl = applicationCert1.applicationUrl;
      fakeCert.publisher = applicationCert1.publisher;
      fakeCert.signature = sign(fakeCert, PRIVATE_KEY);
      fakeCert.signatures = [
        sign(fakeCert, PRIVATE_KEY),
        sign(fakeCert, PRIVATE_KEY)
      ];

      mapServer
        .SetLeaves([leaf], emptyLogRoot)
        .then(() => testPublisherStorage(publisherCert1))
        .then(storage =>
          new ApplicationStorage(logServer, mapServer, storage).create(fakeCert)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has already a registered certificate!");
          done();
        });
    });

    it("should fail if the cert publisher doesn't match the registered publisher", function(done) {
      this.timeout(5000);

      const badCert = cloneDeep(applicationCert1);
      badCert.publisher.subjectPublicKey = publisherCert2.subjectPublicKey;

      testPublisherStorage(publisherCert1)
        .then(storage =>
          new ApplicationStorage(logServer, mapServer, storage).create(badCert)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain(
            "does not match the registered certificate"
          );
          done();
        });
    });
  });

  describe("update", () => {
    it("should create an UPDATE entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const publisherStorage = await testPublisherStorage(
        publisherCert1,
        publisherCert2
      );
      const storage = new ApplicationStorage(
        logServer,
        mapServer,
        publisherStorage
      );

      const appCert2 = cloneDeep(applicationCert2);
      appCert2.applicationUrl = applicationCert1.applicationUrl;

      await storage.create(applicationCert1);

      await storage.update(appCert2);

      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });

      expect(leaves.length).to.equal(2);

      const entry = LogEntry.deserializeBinary(leaves[1].getLeafValue_asU8());
      expect(entry.getDomain()).to.equal(appCert2.applicationUrl);
      const cert = JSON.parse(entry.getCert());
      expect(cert).to.deep.equal(appCert2);
      expect(entry.getOperation()).to.equal(Operation.UPDATE);

      const mapIndex = CreateMapIndex(appCert2.applicationUrl);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal(appCert2.applicationUrl);
      const revived = JSON.parse(mapEntry.getCert());
      expect(revived).to.deep.equal(appCert2);
    });

    it("should fail if no old certificate exists in the map", function(done) {
      this.timeout(20000);

      testPublisherStorage(publisherCert1, publisherCert2)
        .then(storage =>
          new ApplicationStorage(logServer, mapServer, storage).update(
            applicationCert2
          )
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has no registered certificate!");
          done();
        });
    });

    it("should fail if the cert publisher doesn't match the registered publisher", function(done) {
      this.timeout(10000);

      const badCert = cloneDeep(applicationCert1);
      badCert.publisher.subjectPublicKey = publisherCert2.subjectPublicKey;

      testPublisherStorage(publisherCert1)
        .then(storage =>
          new ApplicationStorage(logServer, mapServer, storage).update(badCert)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain(
            "does not match the registered certificate"
          );
          done();
        });
    });
  });

  describe("exists", () => {
    it("should return false if the given cert doesn't exist in the map", async function() {
      this.timeout(5000);

      const res = await new ApplicationStorage(
        logServer,
        mapServer,
        await testPublisherStorage()
      ).exists(applicationCert1.applicationUrl);

      expect(res).to.be.false;
    });

    it("should return true if the given cert exists in the map", async function() {
      this.timeout(5000);

      const { publisher, ...mapCert } = applicationCert1;
      const json = stringify({
        publisher: publisher.subject,
        ...mapCert
      });

      const entry = new MapEntry();
      entry.setCert(json);
      entry.setDomain(applicationCert1.applicationUrl);
      const index = CreateMapIndex(applicationCert1.applicationUrl);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const res = await new ApplicationStorage(
        logServer,
        mapServer,
        await testPublisherStorage()
      ).exists(applicationCert1.applicationUrl);

      expect(res).to.be.true;
    });
  });

  describe("getVerifiable", () => {
    it("should return a proof of absence if no cert for the given subject exists in the map", async function() {
      this.timeout(5000);

      const storage = await testPublisherStorage();
      const inclusion = await new ApplicationStorage(
        logServer,
        mapServer,
        storage
      ).getVerifiable(applicationCert1.applicationUrl);

      expect(inclusion.cert).to.be.undefined;
    });

    it("should return the included certificate for a leaf in the map", async function() {
      this.timeout(5000);

      const entry = new MapEntry();
      entry.setCert(stringify(applicationCert1));
      entry.setDomain(applicationCert1.applicationUrl);
      const index = CreateMapIndex(applicationCert1.applicationUrl);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const inclusion = await new ApplicationStorage(
        logServer,
        mapServer,
        await testPublisherStorage(publisherCert1)
      ).getVerifiable(applicationCert1.applicationUrl);

      expect(inclusion.cert).to.deep.equal(applicationCert1);
    });
  });

  describe("delete", () => {
    it("should insert a DELETE entry in the log and an empty leaf value into the map", async function() {
      this.timeout(10000);

      const publisherStorage = await testPublisherStorage(publisherCert1);
      const storage = new ApplicationStorage(
        logServer,
        mapServer,
        publisherStorage
      );

      await storage.create(applicationCert1);

      await storage.delete(applicationCert1.applicationUrl);

      const existing = await storage.exists(applicationCert1.applicationUrl);

      expect(existing).to.be.false;

      const leaves = await logServer.GetLeavesByRange({
        start: "1",
        count: "1"
      });

      expect(leaves).to.have.lengthOf(1);

      const entry = LogEntry.deserializeBinary(leaves[0].getLeafValue_asU8());

      expect(entry.getDomain()).to.equal(applicationCert1.applicationUrl);
      expect(entry.getOperation()).to.equal(Operation.DELETE);
      const revived = JSON.parse(entry.getCert());
      expect(revived).to.deep.equal(applicationCert1);

      const mapIndex = CreateMapIndex(applicationCert1.applicationUrl);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);

      expect(mapLeaves).to.have.lengthOf(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );

      expect(mapEntry.getDomain()).to.equal(applicationCert1.applicationUrl);
      expect(mapEntry.getCert()).to.be.empty;
    });
  });
});
