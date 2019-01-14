import "mocha";
import { expect } from "chai";
import { PRIVATE_KEY, createTestAcc, getSignatureRequest } from "../test_data";
import { testCertDatabase } from "./util";
import { processGetSignatureRequest } from "../../src/requests/GetSignature";
import { sign } from "common/crypto/rsa";

describe("GetSignature", () => {
  describe("processGetSignatureRequest", () => {
    const dbStub = testCertDatabase();

    const processRequest = processGetSignatureRequest(
      PRIVATE_KEY,
      dbStub.db as any
    );

    afterEach(() => {
      dbStub.clear();
    });

    it("should return an empty response if no AuditionCertificate is registered", async function() {
      this.timeout(10000);

      const res = await processRequest(getSignatureRequest);

      expect(res.acceptanceConfirmation).to.be.undefined;
      expect(res.request).to.deep.equal(getSignatureRequest);
    });

    it("should return an acceptanceConfirmation if a Certificate is registered", async function() {
      this.timeout(10000);

      const cert = { acceptanceConfirmation: createTestAcc("bla", 3) };

      const expectedConfirmation = {
        data: cert.acceptanceConfirmation,
        signature: sign(cert.acceptanceConfirmation, PRIVATE_KEY)
      };

      await dbStub.db.setAuditionCert(getSignatureRequest.applicationUrl, cert);

      const res = await processRequest(getSignatureRequest);

      expect(res.acceptanceConfirmation).to.deep.equal(expectedConfirmation);
    });
  });
});
