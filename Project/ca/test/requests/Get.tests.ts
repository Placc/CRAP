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
import { parseMapRoot } from "common/trillian/parse";
import { processGetRequest, processGetResponse } from "../../src/requests/Get";
import { GetResponse } from "common/communication/requests/Get";

describe("Get", () => {
  describe("processGetRequest", () => {
    const processRequest = processGetRequest(
      ca1,
      queryParticipant,
      TEST_REQUEST_HOLDER
    );

    it("should fail given an invalid ca list", function(done) {
      this.timeout(60000);
      const invalidReq = cloneDeep(getRequest);
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

      const awaiter = await processRequest(getRequest);
      const response = await awaiter.toPromise();

      expect(spied1.calledOnce).to.be.true;
      expect(spied2.calledOnce).to.be.true;

      expect(spied2.firstCall.args[1]).to.deep.equal(getRequest);
      expect(response.type).to.equal("GetResponse");

      spied1.restore();
      spied2.restore();
    });
  });

  describe("processGetResponse", () => {
    const treeDbStub = testTreeDB();
    const treeDb = treeDbStub as any;

    const processResponse = processGetResponse(
      ca2,
      queryParticipant,
      treeDb,
      PRIVATE_KEY,
      TEST_REQUEST_HOLDER
    );

    it("should fail given an invalid cert", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(getResponse);
      invalidReq.cert!.cas = [];
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as GetResponse<any>)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Illegal ca list in request!");
          done();
        });
    });

    it("should fail given an invalid root signature", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(getResponse);
      invalidReq.rootSignature = { signature: "" };
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as GetResponse<any>)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid root signature!");
          done();
        });
    });

    it("should fail given an invalid proof", function(done) {
      this.timeout(60000);
      const { nonceSignature, ...invalidReq } = cloneDeep(getResponse);
      invalidReq.proof = "";
      invalidReq["nonceSignature"] = createTestAcc(invalidReq, 1);

      processResponse(ils1, invalidReq as GetResponse<any>)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => done());
    });

    it("should fail given an invalid RootResponse", function(done) {
      this.timeout(60000);

      treeDb.set(ils1, "PublisherCertificate", emptyMapRoot);

      processResponse(ils1, getResponse)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Invalid Root Revision!");
          done();
        });
    });
  });
});
