import { Certificate, ARPKICert, RegisteredCert } from "common/certs/types";
import {
  ARPKICertStorage,
  InclusionProof,
  AuditProof,
  ConsistencyProof
} from "./types";
import { MapEntry, LogEntry, Operation } from "common/trillian/entry/entry_pb";
import {
  BuildLogLeafForEntry,
  BuildLogLeaf,
  BuildMapLeafFromLogLeaf,
  CreateMapIndex
} from "common/trillian/util";
import {
  MapLeaf,
  MapLeafInclusion
} from "common/trillian/api/trillian_map_api_pb";
import { isNil, isEmpty, head } from "lodash";
import { ILSLogServer, ILSMapServer } from "./trillian/types/types";
import { MapRootV1 } from "common/trillian/types";
import { getHash, stringify, getCertDomain } from "common/util/funs";
import { fromValue } from "long";
import { Proof, LogLeaf } from "common/trillian/api/trillian_log_api_pb";
import { TreeInfo } from "common/participants/types";

export abstract class AbstractStorage<C extends Certificate>
  implements ARPKICertStorage<C> {
  protected logServer: ILSLogServer;
  protected mapServer: ILSMapServer;

  constructor(logServer: ILSLogServer, mapServer: ILSMapServer) {
    this.mapServer = mapServer;
    this.logServer = logServer;
  }

  public info(): TreeInfo[] {
    return [this.logServer.TreeInfo, this.mapServer.TreeInfo];
  }

  public async create(cert: ARPKICert<C>): Promise<MapRootV1> {
    const domain = getCertDomain(cert);

    const exists = await this.exists(domain);

    if (exists) {
      throw new Error(`${domain} has already a registered certificate!`);
    }

    const jsonCert = stringify(cert);

    return await this.insertRaw(domain, jsonCert, Operation.CREATE);
  }

  public async update(newCert: ARPKICert<C>): Promise<MapRootV1> {
    const domain = getCertDomain(newCert);

    let loggedCert;
    try {
      loggedCert = await this.get(domain);
      if (isNil(loggedCert) || isEmpty(loggedCert)) throw new Error();
    } catch {
      throw new Error(`${domain} has no registered certificate!`);
    }

    const jsonCert = stringify(newCert);

    return await this.insertRaw(domain, jsonCert, Operation.UPDATE);
  }

  public async exists(domain: string): Promise<boolean> {
    try {
      const cert = await this.getRaw(domain);
      return !isNil(cert) && !isEmpty(cert);
    } catch {
      return false;
    }
  }

  public async getVerifiable(domain: string): Promise<InclusionProof<C>> {
    const jsonCert = await this.getRaw(domain);

    let cert: ARPKICert<C> | undefined = undefined;
    if (!isNil(jsonCert) && !isEmpty(jsonCert)) {
      cert = JSON.parse(jsonCert);
    }

    const index = CreateMapIndex(domain);
    const inclusions = await this.mapServer.GetMapLeaves([index]);

    if (inclusions.length != 1) {
      throw new Error(`Illegal inclusion length for ${domain}!`);
    }

    const proof = head(inclusions)!.toObject();
    const root = await this.mapServer.GetMapRoot();

    return {
      root,
      proof,
      cert
    };
  }

  public async get(domain: string): Promise<ARPKICert<C>> {
    const cert = await this.getRaw(domain);

    if (isNil(cert) || isEmpty(cert)) {
      throw new Error(`Couldn't get certificate for ${domain}`);
    }

    return JSON.parse(cert);
  }

  public async delete(domain: string): Promise<MapRootV1> {
    let logged: string;
    try {
      logged = await this.getRaw(domain);
      if (isNil(logged) || isEmpty(logged)) throw new Error();
    } catch {
      throw new Error(`${domain} has no registered certificate!`);
    }

    return await this.insertRaw(domain, logged, Operation.DELETE);
  }

  public async consistency(
    oldRevision: string,
    newRevision: string
  ): Promise<ConsistencyProof<C>> {
    const currentRoot = await this.mapServer.GetMapRoot();

    if (fromValue(currentRoot.Revision).lte(oldRevision)) {
      const leaves = await this.logServer.GetLeavesByRange({
        start: fromValue(currentRoot.LogRoot.TreeSize)
          .sub(1)
          .toString(),
        count: "1"
      });
      const entry = LogEntry.deserializeBinary(
        head(leaves)!.getLeafValue_asU8()
      );
      const cert = JSON.parse(entry.getCert());

      return {
        root: currentRoot,
        proof: new Proof().toObject(),
        latestEntry: cert
      };
    }

    const oldRoot = await this.mapServer.GetMapRoot(oldRevision);
    const newRoot = await this.mapServer.GetMapRoot(newRevision);

    const consistencyProof = await this.logServer.GetConsistencyProof(
      newRoot.LogRoot,
      oldRoot.LogRoot
    );

    const leaves = await this.logServer.GetLeavesByRange({
      start: fromValue(newRoot.LogRoot.TreeSize)
        .sub(1)
        .toString(),
      count: "1"
    });
    const entry = LogEntry.deserializeBinary(head(leaves)!.getLeafValue_asU8());
    const cert = JSON.parse(entry.getCert());

    return {
      root: newRoot,
      proof: consistencyProof.toObject(),
      latestEntry: cert
    };
  }

  public async audit(sinceRevision: string): Promise<AuditProof> {
    const newRoot = await this.mapServer.GetMapRoot();

    if (fromValue(newRoot.Revision).lte(sinceRevision)) {
      return {
        root: newRoot,
        consistencyProof: new Proof().toObject(),
        leaves: [],
        logProofs: [],
        mapProofs: []
      };
    }

    const oldRoot = await this.mapServer.GetMapRoot(sinceRevision);

    const consistencyProof = await this.logServer.GetConsistencyProof(
      newRoot.LogRoot,
      oldRoot.LogRoot
    );

    const leaves = await this.logServer.GetLeavesByRange({
      start: oldRoot.LogRoot.TreeSize,
      count: fromValue(newRoot.LogRoot.TreeSize)
        .sub(oldRoot.LogRoot.TreeSize)
        .toString()
    });

    const logProofs = await Promise.all(
      leaves.map(
        async leaf =>
          await this.logServer.GetInclusionProof(leaf.getMerkleLeafHash_asU8())
      )
    );

    const mapIndicies = leaves.map(leaf => {
      const entry = LogEntry.deserializeBinary(leaf.getLeafValue_asU8());
      const cert = JSON.parse(entry.getCert());
      const domain = getCertDomain(cert);
      return CreateMapIndex(domain);
    });
    const mapProofs = await this.mapServer.GetMapLeaves(mapIndicies);

    return {
      root: newRoot,
      consistencyProof: consistencyProof.toObject(),
      leaves: leaves.map(leaf => leaf.toObject()),
      logProofs: logProofs.map(proof => proof.map(p => p.toObject())),
      mapProofs: mapProofs.map(proof => proof.toObject())
    };
  }

  private async insertRaw(
    domain: string,
    cert: string,
    operation: Operation
  ): Promise<MapRootV1> {
    const logLeaf = BuildLogLeaf(domain, cert, operation);

    const logRoot = await this.logServer.AddLeaf(logLeaf);

    const mapLeaf = BuildMapLeafFromLogLeaf(logLeaf);

    return await this.mapServer.SetLeaves([mapLeaf], logRoot);
  }

  private async getRaw(subject: string): Promise<string> {
    const mapIndex = CreateMapIndex(subject);
    const inclusions = await this.mapServer.GetMapLeaves([mapIndex]);

    if (inclusions.length != 1) {
      throw new Error(
        `Couldn't get inclusion for ${subject} (${inclusions.length})!`
      );
    }

    if (
      isNil(head(inclusions)!.getLeaf()) ||
      isEmpty(
        head(inclusions)!
          .getLeaf()!
          .getLeafValue_asU8()
      )
    ) {
      return "";
    }

    const mapEntry = MapEntry.deserializeBinary(
      head(inclusions)!
        .getLeaf()!
        .getLeafValue_asU8()
    );

    return mapEntry.getCert();
  }
}
