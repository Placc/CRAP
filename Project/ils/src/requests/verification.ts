import { ARPKICert, Certificate } from "common/certs/types";
import { ARPKICertStorage } from "../storage/types";
import { isNil } from "lodash";
import { getCertDomain } from "common/util/funs";

export const verifyNonExistence = async <C extends Certificate>(
  cert: ARPKICert<C>,
  storage: ARPKICertStorage<C>
) => {
  if (isNil(storage) || isNil(cert)) {
    throw new Error("Illegal argument");
  }
  const exists = await storage.exists(getCertDomain(cert));

  if (exists) {
    throw new Error("A certificate is already registered!");
  }
};

export const verifyExistence = async <C extends Certificate>(
  cert: ARPKICert<C>,
  storage: ARPKICertStorage<C>
) => {
  if (isNil(storage) || isNil(cert)) {
    throw new Error("Illegal argument");
  }
  const exists = await storage.exists(getCertDomain(cert));

  if (!exists) {
    throw new Error("A certificate is not registered!");
  }
};
