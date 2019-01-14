import "mocha";
import { expect } from "chai";
import {
  ils1,
  queryParticipant,
  regRequest,
  publisher1,
  deleteRequest,
  deleteResponse
} from "../test_data";
import { stub } from "sinon";
import proxyquire from "proxyquire";
import { TEST_REQUEST_HOLDER } from "../util";

describe("Delete", () => {
  const procModReq = stub();
  const procModRes = stub();
  const compiled = proxyquire.noCallThru()("../../src/requests/Delete", {
    "./modification": {
      processModificationRequest: procModReq,
      processModificationResponse: procModRes
    }
  });

  procModReq.returns(Promise.resolve());
  procModRes.returns(Promise.resolve());

  describe("processDeleteRequest", () => {
    it("should call processModificationRequest with 'DeleteRequest' type", async function() {
      this.timeout(5000);

      await compiled.processDeleteRequest(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, deleteRequest);

      expect(procModReq.calledOnce).to.be.true;
      const args = procModReq.firstCall.args;
      expect(args[args.length - 2].type).to.equal("DeleteRequest");
    });
  });

  describe("processDeleteResponse", () => {
    it("should call processModificationResponse with 'DeleteResponse' type", async function() {
      this.timeout(5000);

      await compiled.processDeleteResponse(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, deleteResponse);

      expect(procModRes.calledOnce).to.be.true;
      const args = procModRes.firstCall.args;
      expect(args[args.length - 2].type).to.equal("DeleteResponse");
    });
  });
});
