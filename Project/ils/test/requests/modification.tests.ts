import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import { testPublisherStorage } from "../storage/util";
import {
  modify,
  processModificationRequest
} from "../../src/requests/modification";
import {
  regRequest,
  PRIVATE_KEY,
  ils1,
  ca2,
  ca1,
  queryParticipant,
  publisher1
} from "../test_data";
import { getHash } from "common/util/funs";
import { cloneDeep } from "lodash";
import { sign } from "common/crypto/rsa";

describe("modification", () => {
  describe("modify", () => {
    it("should execute the corresponding operation and return a signed acceptance", async function() {
      this.timeout(5000);

      const storage = await testPublisherStorage();
      const root = await modify(regRequest, storage);

      expect(root.LogRoot.TreeSize).to.equal("1");
    });
  });

  describe("processModificationRequest", () => {
    it("should execute the request and send a Response to other CAs", async function() {
      const storage = await testPublisherStorage();
      const responseType = "RegistrationResponse";

      const storageSpy = spy(storage, "create");
      const caSpy = spy(ca2, "send");

      const extReq = cloneDeep(regRequest);
      extReq.cert.cas = ["ca.url", "ca2.url"];

      await processModificationRequest(
        ils1,
        PRIVATE_KEY,
        ca1,
        publisher1,
        extReq,
        queryParticipant,
        storage,
        responseType,
        ""
      );

      expect(storageSpy.calledOnce).to.be.true;

      expect(caSpy.calledOnce).to.be.true;
      const response = caSpy.firstCall.args[1];

      expect(response.type).to.equal(responseType);
      expect(response["request"]).to.deep.equal(extReq);

      caSpy.restore();
      storageSpy.restore();
    });
  });
});
