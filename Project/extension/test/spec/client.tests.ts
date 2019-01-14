import "mocha";
import { expect } from "chai";
import proxyquire from "proxyquire";
import {
  queryParticipant,
  ca1,
  applicationCert1,
  ca2,
  ils1,
  publisherCert1
} from "../test_data";
import { spy } from "sinon";
import { createSignature } from "./util";
import { stringify } from "common/util/funs";
import { cloneDeep } from "lodash";

describe("client", () => {
  //TODO audition certificate tests!
  describe("processTab", () => {
    const compiled = proxyquire.noCallThru()("../../src/client/index", {
      "./participants": {
        queryParticipant: _ => queryParticipant
      }
    });
    const process = compiled.processTab;

    it("should complete if no DOM signature exists", async function() {
      await process(
        0,
        "test.url",
        status => {
          expect(status.app.status).to.satisfy(
            s => s == "loading" || s == "complete"
          );
        },
        (_t, _c) => Promise.resolve(new Array()),
        _ => Promise.resolve(""),
        (_t, _c) => Promise.resolve(),
        _ => Promise.reject(),
        true
      );
    });

    it("should query and verify the certificate if a DOM signature is present", async function() {
      const spied = spy(ca1, "send");
      const status = new Array();

      await process(
        0,
        applicationCert1.applicationUrl,
        s => {
          status.push(s);
        },
        (_t, _c) =>
          Promise.resolve(
            new Array([
              createSignature(
                applicationCert1,
                [ca1.url, ca2.url],
                ils1.url,
                false
              )
            ])
          ),
        _ => Promise.resolve(""),
        (_t, _c) => Promise.resolve(),
        _ => Promise.reject(),
        true
      );

      expect(spied.callCount).to.be.gte(1);
      expect(spied.firstCall.args[1].type).to.equal("GetRequest");
      expect(status[status.length - 2].app.status).to.equal("verifying");

      spied.restore();
    });

    it("should fail if a certificate is verified but invalid", async function() {
      const spied = spy(ca1, "send");
      const status = new Array();

      const old = cloneDeep(ils1.trees[1]);
      ils1.trees[1].TreeId = ils1.trees[0].TreeId;

      await process(
        0,
        publisherCert1.subject,
        s => {
          status.push(s);
        },
        (_t, _c) =>
          Promise.resolve(
            new Array([
              createSignature(
                publisherCert1,
                [ca1.url, ca2.url],
                ils1.url,
                false
              )
            ])
          ),
        _ => Promise.resolve(""),
        (_t, _c) => Promise.resolve(),
        _ => Promise.reject(),
        true
      );

      ils1.trees[1] = old;

      expect(spied.callCount).to.be.gte(1);
      expect(spied.firstCall.args[1].type).to.equal("GetRequest");
      expect(status[status.length - 2].app.status).to.equal("loading");
      expect(status[status.length - 1].app.status).to.equal("error");

      spied.restore();
    });

    it("should validate an application certificate and verify its resources", async function() {
      const spied = spy(ca1, "send");
      const status = new Array();

      await process(
        0,
        applicationCert1.applicationUrl,
        s => {
          status.push(s);
        },
        (_t, _c) =>
          Promise.resolve(
            new Array([
              createSignature(
                applicationCert1,
                [ca1.url, ca2.url],
                ils1.url,
                false
              )
            ])
          ),
        _ => Promise.resolve(""),
        (_t, _c) => Promise.resolve(),
        _ => Promise.resolve(applicationCert1.resources),
        true
      );

      expect(spied.callCount).to.be.gte(1);
      expect(spied.firstCall.args[1].type).to.equal("GetRequest");
      expect(status[1].app.status).to.equal("verifying");
      status.slice(2).forEach(s => {
        expect(s.app.status).to.equal("verified");
      });

      spied.restore();
    });
  });
});
