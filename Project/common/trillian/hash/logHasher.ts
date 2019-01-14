import { createHash } from "crypto";
import { LogHasher } from "./types";

const RFC6962LeafHashPrefix = 0;
const RFC6962NodeHashPrefix = 1;

const Strategy = "sha256";

export const New = () => createHash(Strategy);

const Hasher: LogHasher = {
  emptyRoot: () => {
    return New().digest();
  },
  hashLeaf: (leafValue: Uint8Array) => {
    return New()
      .update(new Uint8Array([RFC6962LeafHashPrefix]))
      .update(leafValue)
      .digest();
  },
  hashChildren: (left: Uint8Array, right: Uint8Array) => {
    return New()
      .update(new Uint8Array([RFC6962NodeHashPrefix]))
      .update(left)
      .update(right)
      .digest();
  },
  size: () => 32
};

export default Hasher;
