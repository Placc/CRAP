import "mocha";
import { expect } from "chai";
import { deleteAllTrees } from "./util";
import { updateIlsRoots } from "../../src/Monitor";
import {
  ils1,
  ca1,
  ca2,
  queryParticipant,
  auditResponse,
  NONCE,
  PRIVATE_KEY,
  alter
} from "../test_data";
import { MonitorConfiguration } from "../../src/config/types";
import { spy } from "sinon";
import { AuditResponse } from "common/communication/requests/Audit";
import { sign } from "common/crypto/rsa";
import { TreeRootDatabase } from "../../src/db";

describe("Monitor", () => {
  describe("monitorILS", () => {
    const knownCAs = [ca1.url, ca2.url];
    const db = new TreeRootDatabase();
    const dbSpy = spy(db, "set");

    afterEach(function(done) {
      dbSpy.resetHistory();
      deleteAllTrees().then(() => done());
    });

    it("should fail on invalid signatures", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const oldRes = (await oldSend(_e, req)) as AuditResponse;
        const newRes = alter(oldRes, "consistencyProofSignature", "");
        return newRes;
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain(
            "Couldn't verify consistency proof signature"
          );
          done();
        });
    });

    it("should fail on wrong consistency proof", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const oldRes = (await oldSend(_e, req)) as AuditResponse;
        return alter(oldRes, "consistencyProof", "[]");
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain("Couldn't verify consistency proof");
          done();
        });
    });

    it("should fail on wrong log proof list", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const oldRes = (await oldSend(_e, req)) as AuditResponse;
        const logProofs = "[]";
        const logProofsSignature = sign(logProofs, PRIVATE_KEY);
        return alter(
          alter(oldRes, "logProofs", logProofs),
          "logProofsSignature",
          logProofsSignature
        );
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain("Number of leaves and proofs differs");
          done();
        });
    });

    it("should fail on wrong log proof", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const oldRes = (await oldSend(_e, req)) as AuditResponse;
        const logProofs =
          '[[{"hashesList":["7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","S1KSXlrfT3x53XHd7fAkx33xDD3jHzHbx3lXpMfFjYY="],"leafIndex":"1"}],[{"hashesList":["S1KSXlrfT3x53XHd7fAkx33xDD3jHzHbx3lXpMfFjYY="],"leafIndex":"2"}]]';
        const logProofsSignature = sign(logProofs, PRIVATE_KEY);
        return alter(
          alter(oldRes, "logProofs", logProofs),
          "logProofsSignature",
          logProofsSignature
        );
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain("Invalid beginning of log proof");
          done();
        });
    });

    it("should fail on wrong map proof list", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const oldRes = (await oldSend(_e, req)) as AuditResponse;
        const mapProofs = "[]";
        const mapProofsSignature = sign(mapProofs, PRIVATE_KEY);
        return alter(
          alter(oldRes, "mapProofs", mapProofs),
          "mapProofsSignature",
          mapProofsSignature
        );
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain(
            "Map proof snapshot and leaves obtained from history differ"
          );
          done();
        });
    });

    it("should fail on wrong map proof", function(done) {
      this.timeout(10000);

      const oldSend = ca1.send;
      ca1.send = async (_e, req) => {
        const realRes = (await oldSend(_e, req)) as AuditResponse;
        const mapProofs =
          '[{"inclusionList":["TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"bKF0Clh/kpOH+Aq6ydxM5WdRbs5w9Zj5IVeVHJFfaFM=","leafValue":"CglwdWJsaXNoZXISogt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJpbHNUaW1lb3V0IjowLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiZk1iTXpjNWZGOGpZSS9xZ1VGTjNpSUdNOTdNMzE2MzQ2L1E1czhjYVZLcGZaclQ5TXdRTTg3WVVzaldFQitLL3ltaGZwYUU3M251SnpQNVBVTW5Fa25JZjdtMmxsTmdhWXlMcGs2eithdDFaYkdnYlpjQzRsbnh1T0RUeTVZY3lLTFdoaUNMRWdVS0g4QXduYnRWaDdhMjREK3NYVk1aWHNaNVB6cGFad2Jrc1NYZStHdG9TT3VzY0N5a1NvcGR0OUxzdVBhbUZ2VU9IbmNYaUNWRUJPWnVtVzJoTzdGb0VSM0ZCQXF2Rno5S2h2Z1pYQURBNjg0UXRQVy9UMnJHdXhsQm1ReWtzSmc2YlBQL2NRR01EeEJvZ2tDMzlxVWgwVk9mVzNUZHBJMjNRbGlCMUc1SzZTTHVEa0NKNUo1c3lHVlZUVStNQ3MvdTBWQjgzVFJFK2p3PT0iLCJmTWJNemM1ZkY4allJL3FnVUZOM2lJR005N00zMTYzNDYvUTVzOGNhVktwZlpyVDlNd1FNODdZVXNqV0VCK0sveW1oZnBhRTczbnVKelA1UFVNbkVrbklmN20ybGxOZ2FZeUxwazZ6K2F0MVpiR2diWmNDNGxueHVPRFR5NVljeUtMV2hpQ0xFZ1VLSDhBd25idFZoN2EyNEQrc1hWTVpYc1o1UHpwYVp3YmtzU1hlK0d0b1NPdXNjQ3lrU29wZHQ5THN1UGFtRnZVT0huY1hpQ1ZFQk9adW1XMmhPN0ZvRVIzRkJBcXZGejlLaHZnWlhBREE2ODRRdFBXL1Qyckd1eGxCbVF5a3NKZzZiUFAvY1FHTUR4Qm9na0MzOXFVaDBWT2ZXM1RkcEkyM1FsaUIxRzVLNlNMdURrQ0o1SjVzeUdWVlRVK01Dcy91MFZCODNUUkUranc9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ=="}}]';
        const mapProofsSignature = sign(mapProofs, PRIVATE_KEY);
        return alter(
          alter(realRes, "mapProofs", mapProofs),
          "mapProofsSignature",
          mapProofsSignature
        );
      };

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs)
        .then(t => done(new Error("Terminated unexpectedly")))
        .catch(e => {
          ca1.send = oldSend;
          expect(e.message).to.contain("calculated root");
          done();
        });
    });

    it("should update the local root after successful verification", function(done) {
      this.timeout(10000);

      updateIlsRoots(ils1.url, queryParticipant, db, knownCAs).then(() => {
        expect(dbSpy.callCount).to.equal(3);
        done();
      });
    });
  });
});
