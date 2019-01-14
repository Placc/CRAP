import "mocha";
import { expect } from "chai";
import { spy } from "sinon";
import { createCA, testServer, deleteAllTrees } from "./util";
import { createMessage, parseMessage } from "common/communication/message";
import {
  regRequest,
  ils1,
  ca2,
  getRequest,
  updateRequest1,
  deleteRequest,
  auditRequest,
  ils2,
  publisherCert1,
  PRIVATE_KEY,
  publisher1,
  ARPKIPublisherCert,
  regResponse,
  ca1,
  updateResponse,
  getResponse,
  deleteResponse,
  auditResponse,
  deleteRequest1,
  generateRequest1,
  generateRequest2,
  send,
  PUBLIC_KEY
} from "../test_data";
import { cloneDeep } from "lodash";
import { getHash, stringify } from "common/util/funs";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import { ILSInfo, ContentType, TreeType, ILS } from "common/participants/types";
import { VerifyMapLeafInclusionHash } from "common/trillian/verification/mapVerifier";
import { PublisherCertificate } from "common/certs/types";
import { sign, encryptPublic } from "common/crypto/rsa";
import { parseMapLeafInclusion, parseMapRoot } from "common/trillian/parse";
import { SynchronizationRequest } from "common/communication/requests/Synchronization";
import { isString } from "common/util/guards";
import { Request, Response } from "common/communication/types";
import { isValidAuditionCertificate } from "common/certs/validators";
import proxyquire from "proxyquire";
import { isEmpty } from "lodash";
import { isValidCryptoKey } from "common/crypto/validators";

//TODO: WAAAY MORE TESTS (especially for responses!)
describe("ca", () => {
  let server: ChaiHttp.Agent;
  let ils: ILS;

  beforeEach(function(done) {
    this.timeout(10000);
    createCA().then(objects => {
      server = objects.ca;
      ils = objects.ils;
      done();
    });
  });

  afterEach(function(done) {
    this.timeout(10000);
    server.close();
    deleteAllTrees().then(() => done());
  });

  /*it("HEEELP", () => {
    const key = JSON.parse(
      `{"data": "-----BEGIN PUBLIC KEY-----\\nMIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBuvd0vZY7aetfLgH/qQr/X\\nmnaloatJ4fTdlwm4BKEnwwiXq3MPZeYZfD6TvmItHT4LzpIc9LhRZSJJQfUKfglx\\nrMCxFvA3VkhfxXXUsTyS5kno27+22BltjuNc4WQQmqUU4dDTOiEoq+RP22CqRumS\\nV1dnr4HQexWHtBnX33mS4N/t8sTBUJb161YB6oXQQO2ZhNjdaKG8ncHhagp++yJE\\nSSOtEg4TaYZ5nIF+ekS5ZNiZU1NpvwADZCynNOMJRoZbB2Zw8HEC7thZ+MOH0oAE\\nGzUfHAyOHNfYXJi72h5z/SkvDhS8h2c/gIzOfpN5a5S26CCLPgAPE/Dw0S3dyaJN\\nAgMBAAE=\\n-----END PUBLIC KEY-----\\n","format": "public"}`
    );

    console.log(isValidCryptoKey(key));
  });*/

  describe("/register", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/register")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(regRequest, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a Publisher", function(done) {
      server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(regRequest, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should process the registration procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ils, "send");

      const res = await server
        .post("/register")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(createMessage(regRequest, ca1, testServer));

      expect(res.status).to.equal(200);
      expect(spied.calledOnce).to.be.true;

      const { acceptanceConfirmation, ...cert } = spied.firstCall.args[1][
        "cert"
      ];
      expect(cert).to.deep.equal(regRequest.cert);

      const parsedMessage = parseMessage(res.text, ca2, publisher1, testServer);

      expect(parsedMessage).to.deep.equal(regResponse);

      spied.restore();
    });
  });

  describe("/update", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/update")
        .type("text/plain")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(updateRequest1, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a Publisher", function(done) {
      server
        .post("/update")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(updateRequest1, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should process the update procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ils, "send");

      const res = await server
        .post("/update")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(createMessage(updateRequest1, ca1, testServer));

      expect(res.status).to.equal(200);
      expect(spied.calledOnce).to.be.true;

      const { acceptanceConfirmation, ...cert } = spied.firstCall.args[1][
        "cert"
      ];
      expect(cert).to.deep.equal(updateRequest1.cert);

      const parsedMessage = parseMessage(res.text, ca2, publisher1, testServer);

      expect(parsedMessage).to.deep.equal(updateResponse);

      spied.restore();
    });
  });

  describe("/get", () => {
    it("should process the get procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ils, "send");

      const res = await server
        .post("/get")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(encryptPublic(stringify(getRequest), PUBLIC_KEY));

      expect(res.status).to.equal(200);
      expect(spied.calledOnce).to.be.true;

      const parsedMessage = JSON.parse(res.text);

      expect(parsedMessage).to.deep.equal(getResponse);

      spied.restore();
    });
  });

  describe("/delete", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(deleteRequest, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should fail if the sender is not a Publisher", function(done) {
      server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url, ca.url")
        .send(createMessage(deleteRequest, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(432);
          expect(res.error.text).to.contain("Illegal sender");
          done();
        });
    });

    it("should fail if the cert is of type PublisherCertificate", function(done) {
      this.timeout(60000);
      server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(createMessage(deleteRequest, ca1, testServer))
        .then(res => {
          expect(res.error.text).to.contain("Invalid request content");
          done();
        });
    });

    it("should process the delete procedure for a valid cert", async function() {
      this.timeout(60000);
      const spied = spy(ils, "send");

      const res = await server
        .post("/delete")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(createMessage(deleteRequest1, ca1, testServer));

      expect(res.status).to.equal(200);
      expect(spied.calledOnce).to.be.true;

      const parsedMessage = parseMessage(res.text, ca2, publisher1, testServer);

      expect(parsedMessage).to.deep.equal(deleteResponse);

      spied.restore();
    });
  });

  describe("/audit", () => {
    it("should process the audit procedure for a valid request", async function() {
      this.timeout(60000);
      const spied = spy(ils, "send");

      const res = await server
        .post("/audit")
        .type("text/plain")
        //.set("X-Forwarded-For", "publisher.url")
        .send(encryptPublic(stringify(auditRequest), PUBLIC_KEY));

      expect(res.status).to.equal(200);

      expect(spied.calledOnce).to.be.true;

      const parsedMessage = JSON.parse(res.text);

      expect(parsedMessage).to.deep.equal(auditResponse);

      spied.restore();
    });
  });

  describe("/generate", () => {
    it("should fail if the requester is not a Publisher", function(done) {
      server
        .post("/generate")
        .type("text/plain")
        .set("X-Forwarded-For", "ca.url")
        .send(createMessage(generateRequest1, ca1, testServer))
        .then(res => {
          expect(res.status).to.equal(401);
          expect(res.error.text).to.contain("Illegal requester");
          done();
        });
    });

    it("should return a the signed certificate", async function() {
      this.timeout(5000);
      const realSend = ils.send;
      ils.send = (e: string, r: Request | Response) => {
        if (r.type == "GetRequest") {
          return Promise.reject();
        }
        return realSend(e, r);
      };
      const realWrite = process.stdout.write;
      process.stdout.write = function(data) {
        if (isString(data) && data.includes("[y/n]")) {
          setTimeout(() => process.stdin.emit("data", "y\r\n"), 200);
        }
        return true;
      };

      const res = await server
        .post("/generate")
        .type("text/plain")
        .set("X-Forwarded-For", "publisher.url")
        .send(createMessage(generateRequest1, ca1, testServer));

      process.stdout.write = realWrite;
      const parsedMessage = parseMessage(res.text, ca1, publisher1, testServer);

      expect(parsedMessage.type).to.deep.equal("GenerateResponse");
      expect(parsedMessage["certSignature"]).to.equal(
        sign(generateRequest1.cert, PRIVATE_KEY)
      );
    });
  });
});
