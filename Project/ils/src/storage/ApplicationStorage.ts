import { ApplicationCertificate, ARPKICert } from "common/certs/types";
import { ILSLogServer, ILSMapServer } from "./trillian/types/types";
import { MapRootV1 } from "common/trillian/types";
import { isEqual } from "lodash";
import { PublisherStorage } from "./PublisherStorage";
import { AbstractStorage } from "./AbstractStorage";
import { ContentType } from "common/participants/types";

export class ApplicationStorage extends AbstractStorage<
  ApplicationCertificate
> {
  private publisherStorage: PublisherStorage;

  constructor(
    log: ILSLogServer,
    map: ILSMapServer,
    publisherStorage: PublisherStorage
  ) {
    if (
      log.TreeInfo.ContentType != ContentType.APPLICATION_CERTIFICATE ||
      map.TreeInfo.ContentType != ContentType.APPLICATION_CERTIFICATE
    ) {
      throw new Error("Wrong TreeInfo ContentType!");
    }

    super(log, map);
    this.publisherStorage = publisherStorage;
  }

  public async create(
    cert: ARPKICert<ApplicationCertificate>
  ): Promise<MapRootV1> {
    await this.validate(cert);
    return await super.create(cert);
  }

  public async update(
    newCert: ARPKICert<ApplicationCertificate>
  ): Promise<MapRootV1> {
    await this.validate(newCert);
    return await super.update(newCert);
  }

  private async validate(
    cert: ARPKICert<ApplicationCertificate>
  ): Promise<void> {
    const { acceptanceConfirmation, ...rawCert } = cert.publisher;
    const registeredPublisher = await this.publisherStorage.getVerifiable(
      cert.publisher.subject
    );

    if (!isEqual(registeredPublisher.cert, rawCert)) {
      throw new Error(
        `The publisher certificate does not match the registered certificate!`
      );
    }

    try {
      const registeredApplication = await this.get(cert.applicationUrl);
      if (registeredApplication.deploymentVersion >= cert.deploymentVersion) {
        throw new Error(
          "The deploymentVersion must not be smaller than of the registered cert!"
        );
      }
    } catch {
      //No certificate found
    }
  }
}
