import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import { createILS, testServer } from "./util";
import { createMessage, parseMessage } from "common/communication/message";
import {
  regRequest,
  ils1,
  ca2,
  getRequest,
  updateRequest,
  updateRequest1,
  deleteRequest,
  deleteRequest1,
  regRequest1,
  getRequest1,
  auditRequest,
  syncRequest,
  ils2,
  syncCommit,
  publisherCert1,
  PRIVATE_KEY,
  regRequest12,
  publisher1,
  ARPKIPublisherCert
} from "../test_data";
import { cloneDeep } from "lodash";
import { getHash, stringify } from "common/util/funs";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import { ILSInfo, ContentType, TreeType } from "common/participants/types";
import { VerifyMapLeafInclusionHash } from "common/trillian/verification/mapVerifier";
import { deleteAllTrees } from "../storage/util";
import { PublisherCertificate } from "common/certs/types";
import { sign } from "common/crypto/rsa";
import { parseMapLeafInclusion, parseMapRoot } from "common/trillian/parse";
import { SynchronizationRequest } from "common/communication/requests/Synchronization";

describe("ils", () => {
  let server: ChaiHttp.Agent;

  beforeEach(function(done) {
    this.timeout(10000);
    createILS().then(agent => {
      server = agent;
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(10000);
    server.close();
    deleteAllTrees().then(() => done());
  });

  describe("/register", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/register")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(regRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a CA", function(done) {
      server
        .post("/register")
        .set("X-Forwarded-For", "publisher.url, publisher.url")
        .send(createMessage(regRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should process the registration procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      const res = await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer));

      expect(res.status).to.equal(202);
      expect(spied.calledOnce).to.be.true;

      const getRes = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(getRes.status).to.equal(202);
      const { acceptanceConfirmation, ...cert } = spied.secondCall.args[1][
        "cert"
      ];
      expect(cert).to.deep.equal(regRequest.cert);

      spied.restore();
    });
  });

  describe("/update", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/update")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(updateRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a CA", function(done) {
      server
        .post("/update")
        .set("X-Forwarded-For", "publisher.url, publisher.url")
        .send(createMessage(updateRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should fail if no certificate is registered", function(done) {
      server
        .post("/update")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(updateRequest, ils1, testServer))
        .then(res => {
          expect(res.error.text).to.contain("A certificate is not registered!");
          done();
        });
    });

    it("should process the update procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer));

      const res = await server
        .post("/update")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(updateRequest1, ils1, testServer));

      expect(res.status).to.equal(202);

      const getRes = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(spied.calledThrice).to.be.true;
      expect(getRes.status).to.equal(202);
      const { acceptanceConfirmation, ...cert } = spied.thirdCall.args[1][
        "cert"
      ];
      expect(cert).to.deep.equal(updateRequest1.cert);

      spied.restore();
    });
  });

  describe("/get", () => {
    it("should fail if the sender is not a CA", function(done) {
      server
        .post("/get")
        .set("X-Forwarded-For", "publisher.url, publisher.url")
        .send(createMessage(getRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should send an empty get response if no certificate is registered", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      const res = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(res.status).to.equal(202);

      expect(spied.calledOnce).to.be.true;
      expect(res.status).to.equal(202);
      expect(spied.firstCall.args[1]["cert"]).to.be.undefined;

      spied.restore();
    });

    it("should process the get procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer));

      const res = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(res.status).to.equal(202);

      const getRes = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(spied.calledThrice).to.be.true;
      expect(getRes.status).to.equal(202);
      const { acceptanceConfirmation, ...cert } = spied.thirdCall.args[1][
        "cert"
      ];
      expect(cert).to.deep.equal(regRequest.cert);

      const infoRes = await server.get("/info").send();
      const info = JSON.parse(infoRes.text) as ILSInfo;
      const tree = info.trees.find(
        t =>
          t.TreeType == TreeType.MAP &&
          t.ContentType == ContentType.PUBLISHER_CERTIFICATE
      )!;

      const proof = parseMapLeafInclusion(spied.thirdCall.args[1]["proof"]);
      const root = parseMapRoot(spied.thirdCall.args[1]["root"]);

      await VerifyMapLeafInclusionHash(tree.TreeId, root.RootHash, proof);

      spied.restore();
    });
  });

  describe("/delete", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/delete")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(deleteRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a CA", function(done) {
      server
        .post("/delete")
        .set("X-Forwarded-For", "publisher.url, publisher.url")
        .send(createMessage(deleteRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should fail if the cert is of type PublisherCertificate", function(done) {
      server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(deleteRequest, ils1, testServer))
        .then(res => {
          expect(res.error.text).to.contain("Invalid request content");
          done();
        });
    });

    it("should fail if no certificate is registered", function(done) {
      this.timeout(60000);

      server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer))
        .then(_ =>
          server
            .post("/delete")
            .type("text/plain")
            .set("X-Forwarded-For", "publisher.url, ca.url")
            .send(createMessage(deleteRequest1, ils1, testServer))
            .then(res => {
              expect(res.error.text).to.contain(
                "A certificate is not registered!"
              );
              done();
            })
        );
    });

    it("should process the delete procedure and remove the cert", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer));

      await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest1, ils1, testServer));

      const res = await server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(deleteRequest1, ils1, testServer));

      expect(res.status).to.equal(202);

      await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest1, ils1, testServer));

      expect(spied.callCount).to.equal(4);
      expect(spied.lastCall.args[1]["cert"]).to.be.undefined;

      spied.restore();
    });
  });

  describe("/audit", () => {
    it("should fail if the sender is not a CA", function(done) {
      server
        .post("/audit")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, publisher.url")
        .send(createMessage(auditRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should send an empty response if the given revision is equal to the current root", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      const res = await server
        .post("/audit")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(auditRequest, ils1, testServer));

      expect(res.status).to.equal(202);

      expect(spied.calledOnce).to.be.true;

      const response = spied.firstCall.args[1];
      expect(JSON.parse(response["leaves"])).to.be.empty;
      expect(JSON.parse(response["consistencyProof"]).hashesList).to.be.empty;

      spied.restore();
    });

    it("should send an audit response to other CAs if the given revision is smaller than the current root", async function() {
      this.timeout(60000);
      const spied = spy(ca2, "send");

      await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer));

      const res = await server
        .post("/audit")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(auditRequest, ils1, testServer));

      expect(res.status).to.equal(202);

      expect(spied.calledTwice).to.be.true;

      const response = spied.secondCall.args[1];

      expect(JSON.parse(response["leaves"])).to.have.lengthOf(1);
      expect(JSON.parse(response["root"]).Revision).to.equal("1");

      spied.restore();
    });
  });

  describe("/sync", () => {
    it("should fail if the requester is not an ILS", function(done) {
      server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(syncRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not an ILS", function(done) {
      server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com, publisher.url")
        .send(createMessage(syncRequest, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should fail if no cert is registered for an update request", function(done) {
      const { signature, ...request } = cloneDeep(syncRequest);
      request.request = updateRequest1;
      const newSig = sign(request, PRIVATE_KEY);
      server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(
          createMessage(
            { ...request, signature: newSig } as SynchronizationRequest<
              ARPKIPublisherCert
            >,
            ils1,
            testServer
          )
        )
        .then(res => {
          expect(res.error.text).to.contain("A certificate is not registered");
          done();
        });
    });

    it("should fail if no cert is registered for a delete request", function(done) {
      const { signature, ...request } = cloneDeep(syncRequest);
      request.request = deleteRequest;
      const newSig = sign(request, PRIVATE_KEY);
      server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(
          createMessage(
            { ...request, signature: newSig } as SynchronizationRequest<
              ARPKIPublisherCert
            >,
            ils1,
            testServer
          )
        )
        .then(res => {
          expect(res.error.text).to.contain("A certificate is not registered");
          done();
        });
    });

    it("should fail if a cert is registered for a registration request", function(done) {
      this.timeout(60000);
      const { signature, ...request } = cloneDeep(syncRequest);
      request.request = regRequest12;
      const newSig = sign(request, PRIVATE_KEY);
      server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ils1, testServer))
        .then(_ =>
          server
            .post("/sync")
            .type("text/plain")
            .set("X-Forwarded-For", "ils2.com")
            .send(
              createMessage(
                { ...request, signature: newSig } as SynchronizationRequest<
                  ARPKIPublisherCert
                >,
                ils1,
                testServer
              )
            )
            .then(res => {
              expect(res.error.text).to.contain(
                "A certificate is already registered"
              );
              done();
            })
        );
    });

    it("should return a sync response on verification success", async function() {
      this.timeout(60000);
      const request = cloneDeep(syncRequest);
      request.request = regRequest;

      const response = await server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(createMessage(request, ils1, testServer));

      expect(response.status).to.equal(200);
      const parsedMessage = parseMessage(
        response.text,
        ils2,
        publisher1,
        testServer
      );

      expect(parsedMessage.type).to.equal("SynchronizationResponse");
      expect(parsedMessage["hash"]).to.equal(getHash(regRequest));
    });
  });

  describe("/sync/commit", () => {
    it("should fail if the requester is not an ILS", function(done) {
      server
        .post("/sync/commit")
        .type("text/plain")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(syncCommit, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not an ILS", function(done) {
      server
        .post("/sync/commit")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com, publisher.url")
        .send(createMessage(syncCommit, ils1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should fail if no pending request exists for the given hash", function(done) {
      server
        .post("/sync/commit")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(createMessage(syncCommit, ils1, testServer))
        .then(res => {
          expect(res.error.text).to.contain("Request not found");
          done();
        });
    });

    it("should execute a pending request and acknowledge it", async function() {
      this.timeout(60000);

      await server
        .post("/sync")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(createMessage(syncRequest, ils1, testServer));

      const response = await server
        .post("/sync/commit")
        .type("text/plain")
        .set("X-Forwarded-For", "ils2.com")
        .send(createMessage(syncCommit, ils1, testServer));

      expect(response.status).to.equal(200);
      const parsedMessage = parseMessage(
        response.text,
        ils2,
        publisher1,
        testServer
      );

      expect(parsedMessage.type).to.equal("SynchronizationAcknowledge");

      const spied = spy(ca2, "send");

      await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(getRequest, ils1, testServer));

      expect(spied.calledOnce).to.be.true;
      const getres = spied.firstCall.args[1];
      expect(getres["cert"]).to.deep.equal(publisherCert1);

      spied.restore();
    });
  });
});
