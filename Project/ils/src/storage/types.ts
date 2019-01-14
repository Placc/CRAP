import { Certificate, ARPKICert } from "common/certs/types";
import { Proof, LogLeaf } from "common/trillian/api/trillian_log_api_pb";
import { MapRootV1 } from "common/trillian/types";
import { MapLeafInclusion } from "common/trillian/api/trillian_map_api_pb";
import { ContentType, TreeInfo } from "common/participants/types";

export type TreeInfos = {
  [t in ContentType]: {
    map: TreeInfo;
    log: TreeInfo;
  }
};

export type InclusionProof<C extends Certificate> = {
  cert?: ARPKICert<C>;
  root: MapRootV1;
  proof: MapLeafInclusion.AsObject;
};

export type ConsistencyProof<C extends Certificate> = {
  root: MapRootV1;
  proof: Proof.AsObject;
  latestEntry: ARPKICert<C>;
};

export type AuditProof = {
  leaves: LogLeaf.AsObject[];
  logProofs: Proof.AsObject[][];
  consistencyProof: Proof.AsObject;
  mapProofs: MapLeafInclusion.AsObject[];
  root: MapRootV1;
};

export interface ARPKICertStorage<C extends Certificate> {
  create(cert: ARPKICert<C>): Promise<MapRootV1>;
  update(newCert: ARPKICert<C>): Promise<MapRootV1>;
  consistency(
    oldRevision: string,
    newRevision: string
  ): Promise<ConsistencyProof<C>>;
  exists(domain: string): Promise<boolean>;
  getVerifiable(domain: string): Promise<InclusionProof<C>>;
  get(domain: string): Promise<ARPKICert<C>>;
  delete(domain: string): Promise<MapRootV1>;
  audit(sinceRevision: string): Promise<AuditProof>;
  info(): TreeInfo[];
}
