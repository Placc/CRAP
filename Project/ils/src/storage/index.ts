import { TreeInfos } from "./types";
import { PublisherStorage } from "./PublisherStorage";
import { ApplicationStorage } from "./ApplicationStorage";
import { AuditionStorage } from "./AuditionStorage";
import { ILSMapServer, ILSLogServer } from "./trillian/types/types";
import NewILSMapServer from "./trillian/server/mapServer";
import NewILLogServer from "./trillian/server/logServer";
import initTrillian from "./init/initTrillian";
import { ContentType, TreeInfo } from "common/participants/types";

export class StorageService {
  private publisher: PublisherStorage;
  private application: ApplicationStorage;
  private audit: AuditionStorage;

  constructor(trees: TreeInfos) {
    const publisherClients = this.createClients(
      trees[ContentType.PUBLISHER_CERTIFICATE]
    );
    this.publisher = new PublisherStorage(
      publisherClients.log,
      publisherClients.map
    );

    const applicationClients = this.createClients(
      trees[ContentType.APPLICATION_CERTIFICATE]
    );
    this.application = new ApplicationStorage(
      applicationClients.log,
      applicationClients.map,
      this.publisher
    );

    const auditCerts = this.createClients(trees[ContentType.AUDIT_CERTIFICATE]);
    this.audit = new AuditionStorage(
      auditCerts.log,
      auditCerts.map,
      this.publisher,
      this.application
    );
  }

  public getPublisherStorage(): PublisherStorage {
    return this.publisher;
  }

  public getApplicationStorage(): ApplicationStorage {
    return this.application;
  }

  public getAuditionStorage(): AuditionStorage {
    return this.audit;
  }

  private createClients(infos: {
    map: TreeInfo;
    log: TreeInfo;
  }): { map: ILSMapServer; log: ILSLogServer } {
    return {
      map: NewILSMapServer(infos.map),
      log: NewILLogServer(infos.log)
    };
  }
}

export default async (): Promise<StorageService> => {
  const trees = await initTrillian();
  return new StorageService(trees);
};
