import "mocha";
import { expect } from "chai";
import { testPublisherStorage } from "../storage/util";
import {
  ils1,
  PRIVATE_KEY,
  queryParticipant,
  ca1,
  publisherCert1,
  getRequest,
  publisherCert2,
  ca2,
  publisher1
} from "../test_data";
import { spy } from "sinon";
import proxyquire from "proxyquire";
import {
  isModificationRequest,
  isModificationResponse
} from "common/communication/requests/Modification";
import { processGetRequest } from "../../src/requests/Get";
import { PublisherCertificate } from "common/certs/types";
import { sign } from "common/crypto/rsa";

describe("Get", () => {
  describe("processGetRequest", () => {
    it("should call remaining cas with a cert in the GetResponse if one exists", async function() {
      this.timeout(5000);

      const spied = spy(ca2, "send");

      const storage = await testPublisherStorage(publisherCert1);

      await processGetRequest(ils1, PRIVATE_KEY, storage, queryParticipant)(
        ca1,
        getRequest,
        publisher1
      );

      expect(spied.calledOnce).to.be.true;
      const args = spied.firstCall.args;
      const { acceptanceConfirmation, ...cert } = args[1]["cert"];
      expect(cert).to.deep.equal(publisherCert1);
      expect(args[1].type).to.equal("GetResponse");

      spied.restore();
    });

    it("should call remaining cas with an empty GetResponse if no cert exists", async function() {
      this.timeout(5000);

      const spied = spy(ca2, "send");

      const storage = await testPublisherStorage();

      await processGetRequest(ils1, PRIVATE_KEY, storage, queryParticipant)(
        ca1,
        getRequest,
        publisher1
      );

      expect(spied.calledOnce).to.be.true;
      const args = spied.firstCall.args;
      expect(args[1]["cert"]).to.be.undefined;
      expect(args[1].type).to.equal("GetResponse");

      spied.restore();
    });
  });
});
