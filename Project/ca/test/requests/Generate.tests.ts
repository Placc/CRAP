import "mocha";
import { expect } from "chai";
import { processGenerateRequest } from "../../src/requests/Generate";
import {
  ca1,
  PRIVATE_KEY,
  publisher1,
  generateRequest1,
  PUBLIC_KEY,
  generateRequest2
} from "../test_data";
import { cloneDeep } from "lodash";
import { verify } from "common/crypto/rsa";
import { isString } from "common/util/guards";

describe("Generate", () => {
  describe("processGenerateRequest", () => {
    const processRequest = processGenerateRequest(ca1, PRIVATE_KEY);

    it("should fail given an invalid cert", function(done) {
      this.timeout(5000);
      const invalidReq = cloneDeep(generateRequest1);
      invalidReq.cert.cas = [];

      processRequest(publisher1, invalidReq)
        .then(res => done(new Error(`Got unexpected result ${res}`)))
        .catch(e => {
          expect(e.message).to.contain("Illegal ca list in request!");
          done();
        });
    });

    it("should demand user acceptance for a PublisherCertificate", async function() {
      this.timeout(5000);
      let observed = false;

      const realWrite = process.stdout.write;
      process.stdout.write = function(data) {
        if (isString(data) && data.includes("[y/n]")) {
          observed = true;
          setTimeout(() => process.stdin.emit("data", "y\r\n"), 200);
        }
        return true;
      };

      const response = await processRequest(publisher1, generateRequest1);
      process.stdout.write = realWrite;

      expect(observed).to.be.true;
      expect(verify(response.request.cert, response.certSignature, PUBLIC_KEY))
        .to.be.true;
    });

    it("should accept an Application certificate automatically", async function() {
      const realWrite = process.stdout.write;
      process.stdout.write = function(data) {
        return true;
      };
      const response = await processRequest(publisher1, generateRequest2);
      process.stdout.write = realWrite;

      expect(verify(response.request.cert, response.certSignature, PUBLIC_KEY))
        .to.be.true;
    });
  });
});
