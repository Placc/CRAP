import { Participant, CA, ILS } from "common/participants/types";
import { CertDatabase } from "../db";
import { Configuration, isConfiguration } from "common/config/types";
import { modifyCertificate } from "common/communication/operations";
import { isNil, head } from "lodash";
import { isString } from "common/util/guards";
import { CryptoKey } from "common/crypto/types";

export type DeleteRequest = {
  applicationUrl: string;
  configuration: Configuration;
};

export const isDeleteRequest = (obj: any): obj is DeleteRequest => {
  return (
    !isNil(obj) &&
    isString(obj.applicationUrl) &&
    isConfiguration(obj.configuration)
  );
};

export const processDeleteRequest = (
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  storage: CertDatabase
) => async (request: DeleteRequest): Promise<void> => {
  const auditionCert = await storage.getAuditionCert(request.applicationUrl);

  if (!auditionCert) {
    throw new Error("No Audition Certificate registered!");
  }

  const signers = (await Promise.all(
    request.configuration.trustedCAs.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const ilses = (await Promise.all(
    request.configuration.trustedILSes.map(
      async ils => await queryParticipant(ils)
    )
  )) as ILS[];

  await modifyCertificate("delete", signers, ilses, auditionCert, privateKey);

  await storage.setAuditionCert(request.applicationUrl, undefined);
};
