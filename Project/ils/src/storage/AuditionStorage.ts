import {
  ARPKICert,
  RegisteredCert,
  AuditionCertificate,
  PublisherCertificate
} from "common/certs/types";
import { ILSLogServer, ILSMapServer } from "./trillian/types/types";
import { MapRootV1 } from "common/trillian/types";
import { isEqual } from "lodash";
import { PublisherStorage } from "./PublisherStorage";
import { AbstractStorage } from "./AbstractStorage";
import { ApplicationStorage } from "./ApplicationStorage";
import { ContentType } from "common/participants/types";

export class AuditionStorage extends AbstractStorage<AuditionCertificate> {
  private publisherStorage: PublisherStorage;
  private applicationStorage: ApplicationStorage;

  constructor(
    log: ILSLogServer,
    map: ILSMapServer,
    publisherStorage: PublisherStorage,
    applicationStorage: ApplicationStorage
  ) {
    if (
      log.TreeInfo.ContentType != ContentType.AUDIT_CERTIFICATE ||
      map.TreeInfo.ContentType != ContentType.AUDIT_CERTIFICATE
    ) {
      throw new Error("Wrong TreeInfo ContentType!");
    }

    super(log, map);
    this.publisherStorage = publisherStorage;
    this.applicationStorage = applicationStorage;
  }

  public async create(
    cert: ARPKICert<AuditionCertificate>
  ): Promise<MapRootV1> {
    await this.validateApplication(cert);
    await this.validateAuditor(cert);
    return await super.create(cert);
  }

  public async update(
    newCert: ARPKICert<AuditionCertificate>
  ): Promise<MapRootV1> {
    await this.validateApplication(newCert);
    await this.validateAuditor(newCert);
    return await super.update(newCert);
  }

  private async validateApplication(
    cert: ARPKICert<AuditionCertificate>
  ): Promise<void> {
    const registeredApp = await this.applicationStorage.get(cert.application);

    if (registeredApp.deploymentVersion < cert.applicationVersion) {
      throw new Error(
        `The application does not match the registered certificate!`
      );
    }
  }

  private async validateAuditor(
    cert: ARPKICert<AuditionCertificate>
  ): Promise<void> {
    const { acceptanceConfirmation, ...rawCert } = cert.auditor;
    const registeredAuditor = await this.publisherStorage.getVerifiable(
      cert.auditor.subject
    );

    if (!isEqual(registeredAuditor.cert, rawCert)) {
      throw new Error(`The auditor does not match the registered certificate!`);
    }
  }
}
