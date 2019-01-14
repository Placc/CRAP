import "mocha";
import { expect } from "chai";
import { testPublisherStorage } from "../storage/util";
import { processRegistrationRequest } from "../../src/requests/Registration";
import {
  ils1,
  PRIVATE_KEY,
  queryParticipant,
  ca1,
  publisherCert1,
  regRequest,
  publisher1
} from "../test_data";
import { PublisherCertificate } from "common/certs/types";
import { stub } from "sinon";
import proxyquire from "proxyquire";
import {
  isModificationRequest,
  isModificationResponse
} from "common/communication/requests/Modification";
import { sign } from "common/crypto/rsa";

describe("Registration", () => {
  describe("processRegistrationRequest", () => {
    it("should fail if a certificate already exists", function(done) {
      testPublisherStorage(publisherCert1)
        .then(storage =>
          processRegistrationRequest(
            ils1,
            PRIVATE_KEY,
            storage,
            queryParticipant
          )(ca1, regRequest, publisher1)
        )
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("A certificate is already registered!");
          done();
        });
    });

    it("should call processModificationRequest with 'RegistrationResponse' type", async function() {
      this.timeout(5000);

      const procModReq = stub();
      const compiled = proxyquire.noCallThru()(
        "../../src/requests/Registration",
        {
          "./modification": {
            isModificationRequest: isModificationRequest,
            isModificationResponse: isModificationResponse,
            processModificationRequest: procModReq
          }
        }
      );

      const storage = await testPublisherStorage();

      const process = compiled.processRegistrationRequest(
        ils1,
        PRIVATE_KEY,
        storage,
        c => Promise.resolve(true),
        queryParticipant
      );

      procModReq.returns(Promise.resolve());

      await process(ca1, regRequest, publisher1);

      expect(procModReq.calledOnce).to.be.true;
      const args = procModReq.firstCall.args;
      expect(args[args.length - 2]).to.equal("RegistrationResponse");
    });
  });
});
