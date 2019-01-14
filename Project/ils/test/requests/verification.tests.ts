import "mocha";
import { expect } from "chai";
import { verifyParticipants } from "common/certs/verification";
import {
  verifyNonExistence,
  verifyExistence
} from "../../src/requests/verification";
import { ILS } from "common/participants/types";
import {
  ils1,
  publisherCert1,
  PRIVATE_KEY,
  ca1,
  PUBLIC_KEY,
  publisherCert2
} from "../test_data";
import { cloneDeep } from "lodash";
import { sign } from "common/crypto/rsa";
import { ARPKICert, PublisherCertificate } from "common/certs/types";
import { testPublisherStorage } from "../storage/util";
import { ARPKICertStorage } from "../../src/storage/types";

describe("verification", () => {
  describe("verifyParticipants", () => {
    it("should throw if CA_LIST contains multiple equal entries", () => {
      const cas = ["ca1.url", "ca2.url", "ca1.url"];
      const ilses = ["ils.com"];
      const set = { cas, ilses };
      expect(() => verifyParticipants(ils1, 2, set, set)).to.throw(
        "Illegal ca list in request!"
      );
    });

    it("should throw if ILS_LIST contains multiple equal entries", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com", "ils2.com", "ils.com"];
      const set = { cas, ilses };
      expect(() => verifyParticipants(ils1, 2, set, set)).to.throw(
        "Illegal ils list in request!"
      );
    });

    it("should throw if ILS_LIST doesn't contain the calling ils", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils2.com"];
      const set = { cas, ilses };
      expect(() => verifyParticipants(ils1, 2, set, set)).to.throw(
        "Illegal ils list in request!"
      );
    });

    it("should throw if an argument is nil", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com"];
      const set = { cas, ilses };
      let nullILS: ILS;
      let nullSet: { cas: string[]; ilses: string[] };
      expect(() => verifyParticipants(nullILS, 2, set, set)).to.throw(
        "Illegal argument"
      );
      expect(() => verifyParticipants(ils1, 2, nullSet, set)).to.throw(
        "Illegal argument"
      );
      expect(() => verifyParticipants(ils1, 2, set, nullSet)).to.throw(
        "Illegal argument"
      );
    });

    it("should throw if request CA_LIST is no subset of cert CA_LIST", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils2.com"];
      const subset = { cas, ilses };
      const superset = { cas: ["ca1.url"], ilses };
      expect(() => verifyParticipants(ils1, 2, subset, superset)).to.throw(
        "Illegal ca list in request!"
      );
    });

    it("should throw if request ILS_LIST is no subset of cert ILS_LIST", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com", "ils2.com"];
      const subset = { cas, ilses };
      const superset = { cas, ilses: ["ils.com"] };
      expect(() => verifyParticipants(ils1, 2, subset, superset)).to.throw(
        "Illegal ils list in request!"
      );
    });

    it("should throw if an ILS_LIST is empty", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com"];
      const subset = { cas, ilses };
      const subsetE = { cas, ilses: [] };
      const supersetE = { cas, ilses: [] };
      const superset = { cas, ilses };
      expect(() => verifyParticipants(ils1, 2, subsetE, superset)).to.throw(
        "Illegal ils list in request!"
      );
      expect(() => verifyParticipants(ils1, 2, subset, supersetE)).to.throw(
        "Illegal ils list in request!"
      );
    });

    it("should throw if a CA_LIST has less members than CA_MIN", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com"];
      const subset = { cas, ilses };
      const subsetE = { cas: [], ilses };
      const supersetE = { cas: [], ilses };
      const superset = { cas, ilses };
      expect(() => verifyParticipants(ils1, 2, subsetE, superset)).to.throw(
        "Illegal ca list in request!"
      );
      expect(() => verifyParticipants(ils1, 2, subset, supersetE)).to.throw(
        "Illegal ca list in request!"
      );
    });

    it("should return if the arguments are valid", () => {
      const cas = ["ca1.url", "ca2.url"];
      const ilses = ["ils.com"];
      const subset = { cas, ilses };

      verifyParticipants(ils1, 2, subset, subset);
    });
  });

  describe("verifyNonExistence", () => {
    it("should fail if the given cert exists in storage", function(done) {
      this.timeout(5000);

      testPublisherStorage(publisherCert1)
        .then(storage => verifyNonExistence(publisherCert1, storage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("A certificate is already registered!");
          done();
        });
    });

    it("should fail if the an argument is nil", function(done) {
      this.timeout(5000);

      let nullCert: ARPKICert<PublisherCertificate>;
      let nullStorage: ARPKICertStorage<PublisherCertificate>;

      testPublisherStorage(publisherCert1)
        .then(storage => verifyNonExistence(nullCert, storage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("Illegal argument");
          return Promise.resolve();
        })
        .then(() => verifyNonExistence(publisherCert2, nullStorage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("Illegal argument");
          done();
        });
    });

    it("should return if the given cert doesn't exists in storage", async function() {
      this.timeout(5000);

      const storage = await testPublisherStorage(publisherCert1);
      await verifyNonExistence(publisherCert2, storage);
    });
  });

  describe("verifyExistence", () => {
    it("should fail if the given cert doesn't exist in storage", function(done) {
      this.timeout(5000);

      testPublisherStorage(publisherCert1)
        .then(storage => verifyExistence(publisherCert2, storage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("A certificate is not registered!");
          done();
        });
    });

    it("should fail if the an argument is nil", function(done) {
      this.timeout(5000);

      let nullCert: ARPKICert<PublisherCertificate>;
      let nullStorage: ARPKICertStorage<PublisherCertificate>;

      testPublisherStorage(publisherCert1)
        .then(storage => verifyExistence(nullCert, storage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("Illegal argument");
          return Promise.resolve();
        })
        .then(() => verifyExistence(publisherCert2, nullStorage))
        .then(() => done(new Error("Terminated without error")))
        .catch(e => {
          expect(e.message).to.contain("Illegal argument");
          done();
        });
    });

    it("should return if the given cert exists in storage", async function() {
      this.timeout(5000);

      const storage = await testPublisherStorage(publisherCert1);
      await verifyExistence(publisherCert1, storage);
    });
  });
});
