import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import { createAuditor, deleteAllTrees } from "./util";
import {
  deleteRequest,
  ca1,
  auditRequest,
  getSignatureRequest
} from "../test_data";
import { isMultiSignature } from "common/certs/guards";
import { stringify } from "common/util/funs";
import { isGetSignatureResponse } from "common/communication/requests/GetSignature";

//TODO: WAAAY MORE TESTS (especially for responses!)
describe("auditor", () => {
  let server: ChaiHttp.Agent;

  beforeEach(function(done) {
    this.timeout(10000);
    createAuditor().then(pub => {
      server = pub;
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(10000);
    server.close();
    deleteAllTrees().then(() => done());
  });

  describe("/audit", () => {
    it("should register a publisher certificate in the network on first call", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      const res = await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      expect(res.status).to.equal(204);
      expect(spied.callCount).to.equal(4);

      expect(spied.secondCall.args[0]).to.equal("register");
      expect(spied.secondCall.args[1]["cert"].type).to.equal(
        "PublisherCertificate"
      );

      spied.restore();
    });

    it("should not register a new publisher certificate on further calls", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      const res = await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      expect(res.status).to.equal(204);
      expect(spied.callCount).to.equal(6);

      expect(spied.lastCall.args[0]).to.equal("update");
      expect(spied.lastCall.args[1]["cert"].type).to.equal(
        "AuditionCertificate"
      );

      spied.restore();
    });

    it("should register an application certificate in the network", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      const res = await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      expect(res.status).to.equal(204);
      expect(spied.callCount).to.equal(4);

      expect(spied.lastCall.args[0]).to.equal("register");
      expect(spied.lastCall.args[1]["cert"].application).to.equal(
        auditRequest.applicationUrl
      );

      spied.restore();
    });
  });

  describe("/delete", () => {
    it("should remove an application certificate from the network", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      await server
        .post("/delete")
        .type("application/json")
        .send(deleteRequest);

      expect(spied.callCount).to.equal(5);
      expect(spied.lastCall.args[0]).to.equal("delete");

      spied.restore();
    });
  });

  describe("/get", () => {
    it("should return an empty GetResponse if no certificate is registered", async function() {
      this.timeout(60000);

      const res = await server
        .post("/get")
        .type("application/json")
        .send(getSignatureRequest);

      expect(isGetSignatureResponse(res.body)).to.be.true;
      expect(res.body.acceptanceConfirmation).to.be.undefined;
      expect(res.body.cas).to.be.undefined;
      expect(res.body.ilses).to.be.undefined;
    });

    it("should return an acceptanceConfirmation for a registered cert", async function() {
      this.timeout(60000);

      await server
        .post("/audit")
        .type("application/json")
        .send(auditRequest);

      const res = await server
        .post("/get")
        .type("application/json")
        .send(getSignatureRequest);

      expect(isGetSignatureResponse(res.body)).to.be.true;
      expect(isMultiSignature(res.body.acceptanceConfirmation)).to.be.true;
    });
  });
});
