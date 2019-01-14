import "mocha";
import { expect } from "chai";
import {
  PRIVATE_KEY,
  queryParticipant,
  PUBLIC_KEY,
  createTestAcc,
  deployRequest,
  deleteRequest
} from "../test_data";
import { spy, stub } from "sinon";
import proxyquire from "proxyquire";
import {
  isModificationRequest,
  isModificationResponse
} from "common/communication/requests/Modification";
import { testCertDatabase } from "./util";
import { sign } from "common/crypto/rsa";
import { cloneDeep } from "lodash";
import {
  isPublisherCertificate,
  isMultiSignature,
  isRegisteredCert
} from "common/certs/guards";

describe("Delete", () => {
  describe("processDeleteRequest", () => {
    const dbStub = testCertDatabase();
    const modifyCert = stub();
    modifyCert.callsFake((_e, s, _m, c, _k) =>
      Promise.resolve({
        ...c,
        acceptanceConfirmation: createTestAcc(c, s.length + 1)
      })
    );
    const compiled = proxyquire.noCallThru()("../../src/requests/Delete", {
      "common/communication/operations": {
        modifyCertificate: modifyCert
      }
    });

    const processRequest = compiled.processDeleteRequest(
      PRIVATE_KEY,
      queryParticipant,
      dbStub.db as any
    );

    afterEach(() => {
      modifyCert.resetHistory();
      dbStub.clear();
    });

    it("should fail if no ApplicationCertificate is registered", function(done) {
      this.timeout(10000);

      processRequest(deleteRequest)
        .then(res => done(new Error("Got unexpected result")))
        .catch(e => {
          expect(e.message).to.contain(
            "No Application Certificate registered!"
          );
          done();
        });
    });

    it("should delete an ApplicationCertificate from storage and in the network", async function() {
      this.timeout(10000);

      const cert = { test: "test" };
      await dbStub.db.setAppCert(deleteRequest.applicationUrl, cert);

      await processRequest(deleteRequest);

      expect(modifyCert.calledOnce).to.be.true;
      expect(modifyCert.firstCall.args[0]).to.equal("delete");
      expect(modifyCert.firstCall.args[3]).to.equal(cert);

      const newCert = await dbStub.db.getAppCert(deployRequest.applicationUrl);
      expect(newCert).to.be.undefined;
    });
  });
});
