import "mocha";
import { expect } from "chai";
import {
  PRIVATE_KEY,
  queryParticipant,
  PUBLIC_KEY,
  createTestAcc,
  auditRequest
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

describe("Audit", () => {
  describe("processAuditRequest", () => {
    const dbStub = testCertDatabase();
    const generateCert = stub();
    generateCert.callsFake((s, c, _k) =>
      Promise.resolve({
        ...c,
        signatures: s.map(_s => sign(c, PRIVATE_KEY))
      })
    );
    const modifyCert = stub();
    modifyCert.callsFake((_e, s, _m, c, _k) =>
      Promise.resolve({
        ...c,
        acceptanceConfirmation: createTestAcc(c, s.length + 1)
      })
    );
    const compiled = proxyquire.noCallThru()("../../src/requests/Audit", {
      "common/communication/operations": {
        generateCertificate: generateCert,
        modifyCertificate: modifyCert
      }
    });

    const processRequest = compiled.processAuditRequest(
      PUBLIC_KEY,
      PRIVATE_KEY,
      queryParticipant,
      dbStub.db as any
    );

    afterEach(() => {
      generateCert.resetHistory();
      modifyCert.resetHistory();
      dbStub.clear();
    });

    it("should create a new PublisherCertificate if none is registered", async function() {
      this.timeout(10000);

      await processRequest(auditRequest);

      expect(modifyCert.calledTwice).to.be.true;
      expect(modifyCert.firstCall.args[0]).to.equal("register");
      expect(modifyCert.firstCall.args[3].type).to.equal(
        "PublisherCertificate"
      );

      const cert = await dbStub.db.getPublisherCert();
      expect(isRegisteredCert(cert)).to.be.true;
    });
    it("should create a new PublisherCertificate if forceRecreate is set", async function() {
      this.timeout(10000);

      await processRequest(auditRequest);
      const cert = await dbStub.db.getPublisherCert();

      const forceReq = cloneDeep(auditRequest);
      forceReq.forceRecreate = true;

      await processRequest(forceReq);

      expect(modifyCert.callCount).to.equal(4);
      expect(modifyCert.thirdCall.args[0]).to.equal("update");
      expect(modifyCert.thirdCall.args[3].type).to.equal(
        "PublisherCertificate"
      );

      const newCert = await dbStub.db.getPublisherCert();
      expect(newCert).to.not.equal(cert);
    });
    it("should create an AuditionCertificate if none exists", async function() {
      this.timeout(10000);

      await processRequest(auditRequest);

      expect(modifyCert.calledTwice).to.be.true;
      expect(modifyCert.secondCall.args[0]).to.equal("register");
      expect(modifyCert.secondCall.args[3].type).to.equal(
        "AuditionCertificate"
      );

      const cert = await dbStub.db.getAuditionCert(auditRequest.applicationUrl);

      expect(cert.type).to.equal("AuditionCertificate");
      expect(cert.acceptanceConfirmation).to.not.be.undefined;
    });
    it("should update an AuditionCertificate if one already exists", async function() {
      this.timeout(10000);

      const newCertReq = cloneDeep(auditRequest);
      newCertReq.deploymentVersion = 12346;

      await processRequest(auditRequest);
      const cert = await dbStub.db.getAuditionCert(auditRequest.applicationUrl);

      await processRequest(newCertReq);

      expect(modifyCert.calledThrice).to.be.true;
      expect(modifyCert.thirdCall.args[0]).to.equal("update");
      expect(modifyCert.thirdCall.args[3].type).to.equal("AuditionCertificate");

      const newCert = await dbStub.db.getAuditionCert(
        auditRequest.applicationUrl
      );

      expect(newCert).to.not.equal(cert);
      expect(newCert.applicationVersion).to.equal(12346);
    });
  });
});
