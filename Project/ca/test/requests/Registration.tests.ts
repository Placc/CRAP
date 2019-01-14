import "mocha";
import { expect } from "chai";
import {
  ils1,
  queryParticipant,
  regRequest,
  publisher1,
  regResponse
} from "../test_data";
import { stub } from "sinon";
import proxyquire from "proxyquire";
import { TEST_REQUEST_HOLDER } from "../util";

describe("Registration", () => {
  const procModReq = stub();
  const procModRes = stub();
  const compiled = proxyquire.noCallThru()("../../src/requests/Registration", {
    "./modification": {
      processModificationRequest: procModReq,
      processModificationResponse: procModRes
    }
  });

  procModReq.returns(Promise.resolve());
  procModRes.returns(Promise.resolve());

  describe("processRegistrationRequest", () => {
    it("should call processModificationRequest with 'RegistrationRequest' type", async function() {
      this.timeout(5000);

      await compiled.processRegistrationRequest(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, regRequest);

      expect(procModReq.calledOnce).to.be.true;
      const args = procModReq.firstCall.args;
      expect(args[args.length - 2].type).to.equal("RegistrationRequest");
    });
  });

  describe("processRegistrationResponse", () => {
    it("should call processModificationResponse with 'RegistrationResponse' type", async function() {
      this.timeout(5000);

      await compiled.processRegistrationResponse(
        ils1,
        queryParticipant,
        TEST_REQUEST_HOLDER
      )(publisher1, regResponse);

      expect(procModRes.calledOnce).to.be.true;
      const args = procModRes.firstCall.args;
      expect(args[args.length - 2].type).to.equal("RegistrationResponse");
    });
  });
});
