import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import {
  ca1,
  PRIVATE_KEY,
  publisher1,
  generateRequest1,
  PUBLIC_KEY,
  generateRequest2,
  queryParticipant,
  regRequest,
  ils1,
  regResponse,
  ca2,
  emptyMapRoot,
  getRequest,
  getResponse,
  auditRequest,
  auditResponse,
  createTestAcc
} from "../test_data";
import { cloneDeep } from "lodash";
import { verify, sign } from "common/crypto/rsa";
import { stringify } from "common/util/funs";
import {
  processModificationRequest,
  processModificationResponse
} from "../../src/requests/modification";
import { testTreeDB, TEST_REQUEST_HOLDER } from "../util";
import {
  processAuditRequest,
  processAuditResponse
} from "../../src/requests/Audit";
import { AuditResponse } from "common/communication/requests/Audit";

describe("Audit", () => {
  describe("processAuditRequest", () => {
    const processRequest = processAuditRequest(
      ca1,
      queryParticipant,
      TEST_REQUEST_HOLDER
    );

    it("should fail given an invalid ca list", function(done) {
      this.timeout(60000);
      const invalidReq = cloneDeep(auditRequest);
      invalidReq.cas = [];

      processRequest(invalidReq)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Illegal ca list in request!");
          done();
        });
    });

    it("should add a resolve function to requestHolder and contact the ils", async function() {
      this.timeout(60000);

      const spied1 = spy(TEST_REQUEST_HOLDER, "newRequest");
      const spied2 = spy(ils1, "send");

      const awaiter = await processRequest(auditRequest);
      const response = await awaiter.toPromise();

      expect(spied1.calledOnce).to.be.true;
      expect(spied2.calledOnce).to.be.true;

      expect(spied2.firstCall.args[1]).to.deep.equal(auditRequest);
      expect(response.type).to.equal("AuditResponse");

      spied1.restore();
      spied2.restore();
    });
  });

  describe("processAuditResponse", () => {
    const treeDbStub = testTreeDB();
    const treeDb = treeDbStub as any;

    const processResponse = processAuditResponse(
      ca2,
      queryParticipant,
      treeDb,
      PRIVATE_KEY,
      TEST_REQUEST_HOLDER
    );

    it("should fail given an invalid proof signature", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(auditResponse);
      invalidReq.logProofsSignature = "";
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as AuditResponse)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid logProofs signature!");
          done();
        });
    });

    it("should fail given an invalid root signature", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(auditResponse);
      invalidReq.rootSignature = { signature: "" };
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as AuditResponse)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid root signature!");
          done();
        });
    });

    it("should fail given an invalid proof", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(auditResponse);
      invalidReq.consistencyProof = "";
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as AuditResponse)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => done());
    });

    it("should fail given an invalid root", function(done) {
      this.timeout(60000);

      treeDb.set(ils1, "PublisherCertificate", emptyMapRoot);

      processResponse(ils1, auditResponse)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid Root Revision!");
          done();
        });
    });
  });
});
