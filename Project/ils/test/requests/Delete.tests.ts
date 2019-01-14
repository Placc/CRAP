import "mocha";
import { expect } from "chai";
import { testPublisherStorage } from "../storage/util";
import {
  ils1,
  PRIVATE_KEY,
  queryParticipant,
  ca1,
  publisherCert1,
  deleteRequest,
  publisherCert2,
  publisher1
} from "../test_data";
import { stub } from "sinon";
import proxyquire from "proxyquire";
import {
  isModificationRequest,
  isModificationResponse
} from "common/communication/requests/Modification";
import { processDeleteRequest } from "../../src/requests/Delete";
import { PublisherCertificate } from "common/certs/types";
import { sign } from "common/crypto/rsa";

describe("Delete", () => {
  describe("processDeleteRequest", () => {
    it("should fail if no certificate exists", function(done) {
      testPublisherStorage()
        .then(storage =>
          processDeleteRequest(ils1, PRIVATE_KEY, storage, queryParticipant)(
            ca1,
            deleteRequest,
            publisher1
          )
        )
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("A certificate is not registered!");
          done();
        });
    });

    it("should call processModificationRequest with 'DeleteResponse' type", async function() {
      this.timeout(5000);

      const procModReq = stub();
      const compiled = proxyquire.noCallThru()("../../src/requests/Delete", {
        "./modification": {
          isModificationRequest: isModificationRequest,
          isModificationResponse: isModificationResponse,
          processModificationRequest: procModReq
        }
      });

      const storage = await testPublisherStorage(publisherCert1);

      const process = compiled.processDeleteRequest(
        ils1,
        PRIVATE_KEY,
        storage,
        c => Promise.resolve(true),
        queryParticipant
      );

      procModReq.returns(Promise.resolve());

      await process(ca1, deleteRequest, publisher1);

      expect(procModReq.calledOnce).to.be.true;
      const args = procModReq.firstCall.args;
      expect(args[args.length - 2]).to.equal("DeleteResponse");
    });
  });
});
