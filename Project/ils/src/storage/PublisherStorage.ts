import { PublisherCertificate, ARPKICert } from "common/certs/types";
import { ILSLogServer, ILSMapServer } from "./trillian/types/types";
import { MapRootV1 } from "common/trillian/types";
import { AbstractStorage } from "./AbstractStorage";
import { ContentType } from "common/participants/types";

export class PublisherStorage extends AbstractStorage<PublisherCertificate> {
  constructor(log: ILSLogServer, map: ILSMapServer) {
    if (
      log.TreeInfo.ContentType != ContentType.PUBLISHER_CERTIFICATE ||
      map.TreeInfo.ContentType != ContentType.PUBLISHER_CERTIFICATE
    ) {
      throw new Error("Wrong TreeInfo ContentType!");
    }

    super(log, map);
  }

  public delete(_: string): Promise<MapRootV1> {
    throw new Error("Cannot delete a PublisherCertificate!");
  }
}
