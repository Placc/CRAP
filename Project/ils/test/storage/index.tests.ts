import "mocha";
import { expect } from "chai";
import { deleteAllTrees } from "./util";
import create from "../../src/storage";
import { ApplicationStorage } from "../../src/storage/ApplicationStorage";
import { AuditionStorage } from "../../src/storage/AuditionStorage";

describe("index", () => {
  afterEach(function(done) {
    this.timeout(20000);
    deleteAllTrees().then(_ => done());
  });

  describe("create", () => {
    it("should create storages for publisher, application and audit certificates", async function() {
      this.timeout(20000);

      const service = await create();

      expect(service.getApplicationStorage()).to.be.instanceof(
        ApplicationStorage
      );
      expect(service.getAuditionStorage()).to.be.instanceof(AuditionStorage);
      expect(service.getApplicationStorage()).to.be.instanceof(
        ApplicationStorage
      );
    });
  });
});
