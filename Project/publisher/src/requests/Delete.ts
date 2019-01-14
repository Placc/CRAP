import { Participant, CA, ILS } from "common/participants/types";
import { CertDatabase } from "../db";
import {
  PublisherConfiguration,
  isPublisherConfiguration
} from "../config/types";
import { modifyCertificate } from "common/communication/operations";
import { isNil, head } from "lodash";
import { isString } from "common/util/guards";
import { CryptoKey } from "common/crypto/types";

export type DeleteRequest = {
  applicationUrl: string;
  configuration: PublisherConfiguration;
};

export const isDeleteRequest = (obj: any): obj is DeleteRequest => {
  return (
    !isNil(obj) &&
    isString(obj.applicationUrl) &&
    isPublisherConfiguration(obj.configuration)
  );
};

export const processDeleteRequest = (
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase
) => async (request: DeleteRequest): Promise<void> => {
  const applicationCert = await storage.getAppCert(request.applicationUrl);

  if (!applicationCert) {
    throw new Error("No Application Certificate registered!");
  }

  const signers = (await Promise.all(
    request.configuration.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const ilses = (await Promise.all(
    request.configuration.trustedILSes.map(
      async ils => await queryParticipant(ils)
    )
  )) as ILS[];

  await modifyCertificate(
    "delete",
    signers,
    ilses,
    applicationCert,
    privateKey
  );

  await storage.setAppCert(request.applicationUrl, undefined);
};
