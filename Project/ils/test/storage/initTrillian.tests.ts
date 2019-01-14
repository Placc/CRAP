import "mocha";
import { expect } from "chai";
import initTrillian from "../../src/storage/init/initTrillian";
import { deleteAllTrees, doTreesExist, almostEqual } from "./util";
import log from "loglevel";
import { ContentType } from "common/participants/types";

describe("initTrillian", () => {
  log.setLevel(log.levels.DEBUG, false);

  it("should create and persist maps and logs of all types", async () => {
    const infos = await initTrillian();

    const cTypeNumbers = Object.keys(ContentType).filter(
      k => !isNaN(Number(k))
    );
    expect(Object.keys(infos)).to.deep.equal(cTypeNumbers);
    expect(await doTreesExist(infos)).to.be.true;
  }).timeout(10000);

  it("should reuse existing logs and maps of given types", async () => {
    const infos = await initTrillian();
    const newInfos = await initTrillian();

    expect(almostEqual(infos, newInfos)).to.be.true;
    expect(await doTreesExist(newInfos)).to.be.true;
  }).timeout(15000);

  afterEach(function(done) {
    this.timeout(5000);
    deleteAllTrees().then(_ => done());
  });
});
