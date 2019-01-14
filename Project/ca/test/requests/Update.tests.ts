import "mocha";
import { expect } from "chai";
import {
  ils1,
  queryParticipant,
  regRequest,
  publisher1,
  regResponse,
  updateRequest1,
  updateResponse
} from "../test_data";
import { stub } from "sinon";
import proxyquire from "proxyquire";
import { TEST_REQUEST_HOLDER } from "../util";

describe("Update", () => {
  const procModReq = stub();
  const procModRes = stub();
  const compiled = proxyquire.noCallThru()("../../src/requests/Update", {
    "./modification": {
      processModificationRequest: procModReq,
      processModificationResponse: procModRes
    }
  });

  procModReq.returns(Promise.resolve());
  procModRes.returns(Promise.resolve());

  describe("processUpdateRequest", () => {
    it("should call processModificationRequest with 'UpdateRequest' type", async function() {
      this.timeout(5000);

      await compiled.processUpdateRequest(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, updateRequest1);

      expect(procModReq.calledOnce).to.be.true;
      const args = procModReq.firstCall.args;
      expect(args[args.length - 2].type).to.equal("UpdateRequest");
    });
  });

  describe("processUpdateResponse", () => {
    it("should call processModificationResponse with 'UpdateResponse' type", async function() {
      this.timeout(5000);

      await compiled.processUpdateResponse(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, updateResponse);

      expect(procModRes.calledOnce).to.be.true;
      const args = procModRes.firstCall.args;
      expect(args[args.length - 2].type).to.equal("UpdateResponse");
    });
  });
});
