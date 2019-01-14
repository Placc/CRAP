import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import { createPublisher, deleteAllTrees } from "./util";
import { deleteRequest, ca1, deployRequest } from "../test_data";
import { isMultiSignature } from "common/certs/guards";
import { stringify } from "common/util/funs";

//TODO: WAAAY MORE TESTS (especially for responses!)
describe("publisher", () => {
  let server: ChaiHttp.Agent;

  beforeEach(function(done) {
    this.timeout(10000);
    createPublisher().then(pub => {
      server = pub;
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(10000);
    server.close();
    deleteAllTrees().then(() => done());
  });

  describe("/deploy", () => {
    it("should register a publisher certificate in the network on first call", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      const res = await server
        .post("/deploy")
        .type("application/json")
        .send(deployRequest);

      expect(res.status).to.equal(200);
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
        .post("/deploy")
        .type("application/json")
        .send(deployRequest);

      const res = await server
        .post("/deploy")
        .type("application/json")
        .send(deployRequest);

      expect(res.status).to.equal(200);
      expect(spied.callCount).to.equal(6);

      expect(spied.lastCall.args[0]).to.equal("update");
      expect(spied.lastCall.args[1]["cert"].type).to.equal(
        "ApplicationCertificate"
      );

      spied.restore();
    });

    it("should register an application certificate in the network", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      const res = await server
        .post("/deploy")
        .type("application/json")
        .send(deployRequest);

      expect(res.status).to.equal(200);
      expect(spied.callCount).to.equal(4);

      expect(spied.lastCall.args[0]).to.equal("register");
      expect(spied.lastCall.args[1]["cert"].applicationUrl).to.equal(
        deployRequest.applicationUrl
      );

      const confirmation = JSON.parse(res.text);
      expect(isMultiSignature(confirmation)).to.be.true;

      spied.restore();
    });
  });

  describe("/delete", () => {
    it("should remove an application certificate from the network", async function() {
      this.timeout(60000);
      const spied = spy(ca1, "send");

      await server
        .post("/deploy")
        .type("application/json")
        .send(deployRequest);

      await server
        .post("/delete")
        .type("application/json")
        .send(deleteRequest);

      expect(spied.callCount).to.equal(5);
      expect(spied.lastCall.args[0]).to.equal("delete");

      spied.restore();
    });
  });
});
