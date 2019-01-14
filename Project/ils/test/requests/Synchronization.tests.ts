import "mocha";
import { expect } from "chai";
import {
  processSynchronizationRequest,
  processSynchronizationCommit,
  synchronize
} from "../../src/requests/Synchronization";
import {
  PublisherCertificate,
  ARPKICert,
  Certificate
} from "common/certs/types";
import {
  ils1,
  PRIVATE_KEY,
  queryParticipant,
  publisherCert1,
  syncRequest,
  updateRequest,
  regRequest,
  syncCommit,
  send,
  ils2,
  NONCE
} from "../test_data";
import { testPublisherStorage } from "../storage/util";
import { cloneDeep } from "lodash";
import { getHash } from "common/util/funs";
import { RequestQueue, createQueue } from "../../src/requests/pending";
import { Request, Response } from "common/communication/types";
import { spy } from "sinon";
import {
  isSynchronizationAcknowledge,
  isSynchronizationResponse,
  SynchronizationResponse,
  SynchronizationRequest
} from "common/communication/requests/Synchronization";
import { sign } from "common/crypto/rsa";

describe("Synchronization", () => {
  describe("processSynchronizationRequest", () => {
    const queue = createQueue();
    it("should fail if the request is of type REGISTRATION and the cert exists", function(done) {
      testPublisherStorage(publisherCert1)
        .then(storage =>
          processSynchronizationRequest(
            ils1,
            PRIVATE_KEY,
            queue,
            storage,
            queryParticipant
          )(ils2, syncRequest)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("A certificate is already registered!");
          done();
        });
    });

    it("should fail if the request is of type UPDATE and a cert doesn't exist", function(done) {
      const sync = cloneDeep(syncRequest);
      sync.request = updateRequest;

      testPublisherStorage(publisherCert1)
        .then(storage =>
          processSynchronizationRequest(
            ils1,
            PRIVATE_KEY,
            queue,
            storage,
            queryParticipant
          )(ils2, sync)
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("A certificate is not registered!");
          done();
        });
    });

    it("should add the request to pending and return a SynchronizationResponse", async function() {
      this.timeout(10000);

      const storage = await testPublisherStorage();
      const response = await processSynchronizationRequest(
        ils1,
        PRIVATE_KEY,
        queue,
        storage,
        queryParticipant
      )(ils2, syncRequest);

      expect(isSynchronizationResponse(response)).to.be.true;

      expect(response.hash).to.deep.equal(getHash(syncRequest.request));

      expect(queue.popPending(response.hash).request).to.deep.equal(
        syncRequest.request
      );
    });
  });

  describe("processSynchronizationCommit", () => {
    const queue = createQueue();

    it("should fail if the registered request is not a modification request", function(done) {
      let reg = cloneDeep(regRequest);
      queue.pushPending(reg);

      reg.cert = {} as ARPKICert<PublisherCertificate>;

      testPublisherStorage()
        .then(storage =>
          processSynchronizationCommit(PRIVATE_KEY, queue, storage)(
            ils2,
            syncCommit
          )
        )
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain(
            "Pending request is not for modification!"
          );
          done();
        });
    });

    it("should execute the modification and return a SynchronizationAcknowledge", async function() {
      this.timeout(10000);

      queue.pushPending(regRequest);
      const storage = await testPublisherStorage();
      const response = await processSynchronizationCommit(
        PRIVATE_KEY,
        queue,
        storage
      )(ils2, syncCommit);

      expect(isSynchronizationAcknowledge(response)).to.be.true;
      expect(() => queue.popPending(getHash(regRequest))).to.throw;

      const inclusion = await storage.getVerifiable(regRequest.cert.subject);
      expect(inclusion.cert).to.deep.equal(publisherCert1);
    });
  });

  describe("synchronize", () => {
    it("should fail on wrong hash in SynResp from other ils", function(done) {
      const badIls = cloneDeep(ils1);
      badIls.send = (e: string, req: Request | Response) =>
        Promise.resolve<SynchronizationResponse<Certificate>>({
          type: "SynchronizationResponse",
          request: req as SynchronizationRequest<Certificate>,
          hash: "0",
          ...NONCE(4)
        });

      const confirmation = {
        signature: sign(regRequest, PRIVATE_KEY)
      };

      synchronize(regRequest, confirmation, PRIVATE_KEY, [badIls])
        .then(res => done(new Error(`Got unexpected result: ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("returned wrong SynResp!");
          done();
        });
    });

    it("should contact all given ilses with a SyncRequest and SyncCommit and return their ACKs", async function() {
      this.timeout(5000);

      const spySend = spy(ils1, "send");

      const confirmation = {
        signature: sign(regRequest, PRIVATE_KEY)
      };

      const acks = await synchronize(regRequest, confirmation, PRIVATE_KEY, [
        ils1
      ]);

      expect(spySend.callCount).to.equal(2);
      const arg1 = spySend.firstCall.args[1];
      expect(arg1.type).to.equal("SynchronizationRequest");
      const arg2 = spySend.lastCall.args[1];
      expect(arg2.type).to.equal("SynchronizationCommit");

      expect(acks).to.have.lengthOf(1);
      expect(acks[0].type).to.equal("SynchronizationAcknowledge");

      spySend.restore();
    });
  });
});
