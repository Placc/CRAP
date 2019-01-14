import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import {
  ca1,
  PRIVATE_KEY,
  queryParticipant,
  regRequest,
  ils1,
  regResponse,
  ca2,
  emptyMapRoot,
  publisher1,
  createTestAcc
} from "../test_data";
import { cloneDeep } from "lodash";
import { sign } from "common/crypto/rsa";
import {
  processModificationRequest,
  processModificationResponse
} from "../../src/requests/modification";
import { testTreeDB, TEST_REQUEST_HOLDER } from "../util";
import { RegistrationResponse } from "common/communication/requests/Registration";

describe("Modification", () => {
  describe("processModificationRequest", () => {
    it("should fail given an invalid cert", function(done) {
      this.timeout(60000);
      const invalidReq = cloneDeep(regRequest);
      invalidReq.cert.cas = [];

      processModificationRequest(
        ca1,
        publisher1,
        queryParticipant,
        TEST_REQUEST_HOLDER,
        invalidReq,
        "register"
      )
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

      const awaiter = await processModificationRequest(
        ca1,
        publisher1,
        queryParticipant,
        TEST_REQUEST_HOLDER,
        regRequest,
        "register"
      );
      const response = await awaiter.toPromise();

      expect(spied1.calledOnce).to.be.true;
      expect(spied2.calledOnce).to.be.true;

      expect(spied2.firstCall.args[1]).to.deep.equal(regRequest);
      expect(response.type).to.equal("RegistrationResponse");

      spied1.restore();
      spied2.restore();
    });
  });

  describe("processModificationResponse", () => {
    const treeDbStub = testTreeDB();
    const treeDb = treeDbStub as any;

    it("should fail given an invalid cert", function(done) {
      this.timeout(60000);
      const invalidReq = cloneDeep(regResponse);
      invalidReq.request.cert.cas = [];

      processModificationResponse(
        ca2,
        publisher1,
        queryParticipant,
        treeDb,
        PRIVATE_KEY,
        TEST_REQUEST_HOLDER,
        invalidReq,
        "register"
      )
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Illegal ca list in request!");
          done();
        });
    });

    it("should fail given an invalid signature", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(regResponse);
      invalidReq.logProofSignature = "";
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processModificationResponse(
        ca2,
        publisher1,
        queryParticipant,
        treeDb,
        PRIVATE_KEY,
        TEST_REQUEST_HOLDER,
        invalidReq as RegistrationResponse<any>,
        "register"
      )
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid log proof signature!");
          done();
        });
    });

    it("should fail given an invalid proof", function(done) {
      this.timeout(60000);
      const invalidReq = cloneDeep(regResponse);
      invalidReq.logProof = "";

      processModificationResponse(
        ca2,
        publisher1,
        queryParticipant,
        treeDb,
        PRIVATE_KEY,
        TEST_REQUEST_HOLDER,
        invalidReq,
        "register"
      )
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => done());
    });

    it("should update the root db", async function() {
      this.timeout(60000);

      treeDbStub.set(ils1, "PublisherCertificate", emptyMapRoot);

      const spied1 = treeDbStub.set;

      await processModificationResponse(
        ca2,
        publisher1,
        queryParticipant,
        treeDb,
        PRIVATE_KEY,
        TEST_REQUEST_HOLDER,
        regResponse,
        "register"
      );

      expect(spied1.calledTwice).to.be.true;
      expect(spied1.secondCall.args[0].url).to.equal(ils1.url);
      expect(spied1.secondCall.args[2]).to.deep.equal(
        JSON.parse(regResponse.root)
      );
    });
  });
});
