import "mocha";
import { expect } from "chai";
import { testPublisherStorage } from "../storage/util";
import {
  ils1,
  PRIVATE_KEY,
  queryParticipant,
  ca1,
  publisherCert1,
  auditRequest,
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
import { processAuditRequest } from "../../src/requests/Audit";
import { PublisherCertificate } from "common/certs/types";
import { sign } from "common/crypto/rsa";

describe("Audit", () => {
  //TODO absence test

  describe("processAuditRequest", () => {
    it("should call remaining cas with a AuditResponse", async function() {
      this.timeout(5000);

      const spied = spy(ca2, "send");

      const storage = await testPublisherStorage(publisherCert1);

      await processAuditRequest(ils1, PRIVATE_KEY, storage, queryParticipant)(
        ca1,
        auditRequest,
        publisher1
      );

      expect(spied.calledOnce).to.be.true;
      const args = spied.firstCall.args;
      expect(args[1].type).to.equal("AuditResponse");

      spied.restore();
    });
  });
});
