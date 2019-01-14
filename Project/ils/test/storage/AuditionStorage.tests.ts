import "mocha";
import { expect } from "chai";
import {
  ILSLogServer,
  ILSMapServer
} from "../../src/storage/trillian/types/types";
import {
  testLogServer,
  testMapServer,
  testPublisherStorage,
  testApplicationStorage
} from "./util";
import {
  LogEntry,
  Operation,
  MapEntry
} from "common/trillian/entry/entry_pb";
import { cloneDeep } from "lodash";
import { MapLeaf } from "common/trillian/api/trillian_map_api_pb";
import { createHash } from "crypto";
import { AuditionStorage } from "../../src/storage/AuditionStorage";
import {
  auditCert1,
  publisherCert1,
  applicationCert1,
  applicationCert2,
  publisherCert2,
  auditCert2,
  emptyLogRoot
} from "../test_data";
import { stringify } from "common/util/funs";
import { ContentType } from "common/participants/types";
import { CreateMapIndex } from "common/trillian/util";

describe("AuditionStorage", () => {
  let logServer: ILSLogServer;
  let mapServer: ILSMapServer;

  beforeEach(() => {
    mapServer = testMapServer(ContentType.AUDIT_CERTIFICATE);
    logServer = testLogServer(ContentType.AUDIT_CERTIFICATE);
  });

  describe("constructor", () => {
    it("should throw if log or map content type is not AUDIT_CERTIFICATE", function(done) {
      this.timeout(5000);

      testApplicationStorage().then(storage => {
        const wrongLogClient = cloneDeep(logServer);
        wrongLogClient.TreeInfo.ContentType = ContentType.AUDIT_CERTIFICATE;
        expect(
          () =>
            new AuditionStorage(
              wrongLogClient,
              mapServer,
              storage.publisher,
              storage.application
            )
        ).to.throw;
        done();
      });
    });
  });

  describe("create", () => {
    it("should create an INSERT entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const { application, publisher } = await testApplicationStorage(
        applicationCert1,
        applicationCert2
      );
      const storage = new AuditionStorage(
        logServer,
        mapServer,
        publisher,
        application
      );

      await storage.create(auditCert1);

      const logLeaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });
      expect(logLeaves.length).to.equal(1);

      const logEntry = LogEntry.deserializeBinary(
        logLeaves[0].getLeafValue_asU8()
      );
      expect(logEntry.getDomain()).to.equal(auditCert1.application);
      const revivedLog = JSON.parse(logEntry.getCert());
      expect(revivedLog).to.deep.equal(auditCert1);
      expect(logEntry.getOperation()).to.equal(Operation.CREATE);

      const mapIndex = CreateMapIndex(auditCert1.application);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal(auditCert1.application);
      const revivedMap = JSON.parse(mapEntry.getCert());
      expect(revivedMap).to.deep.equal(auditCert1);
    });

    it("should fail if a certificate already exists", function(done) {
      this.timeout(5000);

      testApplicationStorage(applicationCert1)
        .then(async storages => {
          const storage = new AuditionStorage(
            logServer,
            mapServer,
            storages.publisher,
            storages.application
          );

          const mapEntry = new MapEntry();
          mapEntry.setCert(stringify(auditCert1));
          mapEntry.setDomain(auditCert1.application);
          const index = CreateMapIndex(auditCert1.application);
          const leaf = new MapLeaf();
          leaf.setIndex(index);
          leaf.setLeafValue(mapEntry.serializeBinary());

          await mapServer.SetLeaves([leaf], emptyLogRoot);

          await storages.publisher.create(publisherCert2);

          await storage.create(auditCert1);
        })
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has already a registered certificate!");
          done();
        });
    });

    it("should fail if the cert auditor doesn't match the registered auditor", function(done) {
      this.timeout(5000);

      const badCert = cloneDeep(auditCert1);
      badCert.auditor.subjectPublicKey = publisherCert1.subjectPublicKey;

      testApplicationStorage()
        .then(async storage => {
          await storage.publisher.create(publisherCert2);
          await storage.publisher.create(publisherCert1);
          await storage.application.create(applicationCert1);
          await new AuditionStorage(
            logServer,
            mapServer,
            storage.publisher,
            storage.application
          ).create(badCert);
        })
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain(
            "does not match the registered certificate"
          );
          done();
        });
    });

    it("should fail if the cert application doesn't match the registered application", function(done) {
      this.timeout(5000);

      const badCert = cloneDeep(auditCert1);
      badCert.application = "bad";

      testApplicationStorage()
        .then(async storage => {
          await storage.publisher.create(publisherCert2);
          await storage.publisher.create(publisherCert1);
          await storage.application.create(applicationCert1);
          await new AuditionStorage(
            logServer,
            mapServer,
            storage.publisher,
            storage.application
          ).create(badCert);
        })
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Couldn't get certificate");
          done();
        });
    });
  });

  describe("update", () => {
    it("should create an UPDATE entry in the log and insert the cert in the map", async function() {
      this.timeout(5000);

      const storages = await testApplicationStorage(
        applicationCert1,
        applicationCert2
      );
      const storage = new AuditionStorage(
        logServer,
        mapServer,
        storages.publisher,
        storages.application
      );

      const aCert2 = cloneDeep(auditCert2);
      aCert2.application = auditCert1.application;

      await storage.create(auditCert1);

      await storage.update(aCert2);

      const leaves = await logServer.GetLeavesByRange({
        start: "0",
        count: "256"
      });

      expect(leaves.length).to.equal(2);

      const entry = LogEntry.deserializeBinary(leaves[1].getLeafValue_asU8());
      expect(entry.getDomain()).to.equal(aCert2.application);
      const revivedLog = JSON.parse(entry.getCert());
      expect(revivedLog).to.deep.equal(aCert2);
      expect(entry.getOperation()).to.equal(Operation.UPDATE);

      const mapIndex = CreateMapIndex(aCert2.application);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);
      expect(mapLeaves.length).to.equal(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );
      expect(mapEntry.getDomain()).to.equal(aCert2.application);
      const revivedMap = JSON.parse(entry.getCert());
      expect(revivedMap).to.deep.equal(aCert2);
    });

    it("should fail if no old certificate exists in the map", function(done) {
      this.timeout(20000);

      testApplicationStorage(applicationCert1, applicationCert2)
        .then(storage =>
          new AuditionStorage(
            logServer,
            mapServer,
            storage.publisher,
            storage.application
          ).update(auditCert2)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("has no registered certificate!");
          done();
        });
    });

    it("should fail if the cert publisher doesn't match the registered publisher", function(done) {
      this.timeout(10000);

      const badCert = cloneDeep(auditCert1);
      badCert.auditor.subjectPublicKey = publisherCert1.subjectPublicKey;

      testApplicationStorage(applicationCert1)
        .then(async storage => {
          await storage.publisher.create(publisherCert2);
          await new AuditionStorage(
            logServer,
            mapServer,
            storage.publisher,
            storage.application
          ).update(badCert);
        })
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain(
            "does not match the registered certificate"
          );
          done();
        });
    });

    it("should fail if the cert application doesn't match the registered application", function(done) {
      this.timeout(10000);

      const badCert = cloneDeep(auditCert1);
      badCert.application = "bad";

      testApplicationStorage(applicationCert1)
        .then(async storage => {
          await storage.publisher.create(publisherCert2);
          await new AuditionStorage(
            logServer,
            mapServer,
            storage.publisher,
            storage.application
          ).update(badCert);
        })
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Couldn't get certificate");
          done();
        });
    });
  });

  describe("exists", () => {
    it("should return false if the given cert doesn't exist in the map", async function() {
      this.timeout(5000);

      const storages = await testApplicationStorage();
      const res = await new AuditionStorage(
        logServer,
        mapServer,
        storages.publisher,
        storages.application
      ).exists(auditCert1.application);

      expect(res).to.be.false;
    });

    it("should return true if the given cert exists in the map", async function() {
      this.timeout(5000);

      const entry = new MapEntry();
      entry.setCert(stringify(auditCert1));
      entry.setDomain(auditCert1.application);
      const index = CreateMapIndex(auditCert1.application);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const storages = await testApplicationStorage();

      const res = await new AuditionStorage(
        logServer,
        mapServer,
        storages.publisher,
        storages.application
      ).exists(auditCert1.application);

      expect(res).to.be.true;
    });
  });

  describe("getVerifiable", () => {
    it("should return a proof of absence if no cert for the given subject exists in the map", async function() {
      this.timeout(5000);

      const storage = await testApplicationStorage();
      const inclusion = await new AuditionStorage(
        logServer,
        mapServer,
        storage.publisher,
        storage.application
      ).getVerifiable(auditCert1.application);

      expect(inclusion.cert).to.be.undefined;
    });

    it("should return the included certificate for a leaf in the map", async function() {
      this.timeout(5000);

      const entry = new MapEntry();
      entry.setCert(stringify(auditCert1));
      entry.setDomain(auditCert1.application);
      const index = CreateMapIndex(auditCert1.application);
      const leaf = new MapLeaf();
      leaf.setIndex(index);
      leaf.setLeafValue(entry.serializeBinary());
      await mapServer.SetLeaves([leaf], emptyLogRoot);

      const storages = await testApplicationStorage(
        applicationCert1,
        applicationCert2
      );
      const inclusion = await new AuditionStorage(
        logServer,
        mapServer,
        storages.publisher,
        storages.application
      ).getVerifiable(auditCert1.application);

      expect(inclusion.cert).to.deep.equal(auditCert1);
    });
  });

  describe("delete", () => {
    it("should insert a DELETE entry in the log and an empty leaf value into the map", async function() {
      this.timeout(10000);

      const storages = await testApplicationStorage(
        applicationCert1,
        applicationCert2
      );
      const storage = new AuditionStorage(
        logServer,
        mapServer,
        storages.publisher,
        storages.application
      );

      await storage.create(auditCert1);

      await storage.delete(auditCert1.application);

      const existing = await storage.exists(auditCert1.application);

      expect(existing).to.be.false;

      const leaves = await logServer.GetLeavesByRange({
        start: "1",
        count: "1"
      });

      expect(leaves).to.have.lengthOf(1);

      const entry = LogEntry.deserializeBinary(leaves[0].getLeafValue_asU8());

      expect(entry.getDomain()).to.equal(auditCert1.application);
      expect(entry.getOperation()).to.equal(Operation.DELETE);
      const revivedLog = JSON.parse(entry.getCert());
      expect(revivedLog).to.deep.equal(auditCert1);

      const mapIndex = CreateMapIndex(auditCert1.application);
      const mapLeaves = await mapServer.GetMapLeaves([mapIndex]);

      expect(mapLeaves).to.have.lengthOf(1);

      const mapEntry = MapEntry.deserializeBinary(
        mapLeaves[0].getLeaf()!.getLeafValue_asU8()
      );

      expect(mapEntry.getDomain()).to.equal(auditCert1.application);
      expect(mapEntry.getCert()).to.be.empty;
    });
  });
});
