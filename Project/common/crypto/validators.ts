import { encryptPublic } from "./rsa";
import { isCryptoKey } from "./guards";

export const isValidCryptoKey = (obj: any) => boolean => {
  //TODO real validation, not just trial and error
  try {
    if (isCryptoKey(obj)) {
      encryptPublic("test", obj);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
