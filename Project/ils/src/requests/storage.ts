import { RequestType } from "common/communication/types";
import { Certificate } from "common/certs/types";
import { ARPKICertStorage } from "../storage/types";
import { MapRootV1 } from "common/trillian/types";
import { ModificationRequest } from "common/communication/requests/Modification";
import { getCertDomain } from "common/util/funs";
import { isEqual } from "lodash";

export type ModificationFunction<C extends Certificate> = (
  request: ModificationRequest<C>
) => Promise<MapRootV1>;

export const getStorageOperation = <C extends Certificate>(
  typ: RequestType,
  storage: ARPKICertStorage<C>
): ModificationFunction<C> => {
  switch (typ) {
    case "RegistrationRequest":
      return (request: ModificationRequest<C>) => storage.create(request.cert);
    case "UpdateRequest":
      return (request: ModificationRequest<C>) => storage.update(request.cert);
    case "DeleteRequest":
      return async (request: ModificationRequest<C>) => {
        const existing = await storage.get(getCertDomain(request.cert));
        if (!isEqual(existing, request.cert)) {
          throw new Error("Cert to delete does not equal existing!");
        }

        return storage.delete(getCertDomain(request.cert));
      };
    default:
      throw new Error(`${typ} not of type Registration/Update/Delete!`);
  }
};
