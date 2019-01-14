import { Certificate, MultiSignature } from "common/certs/types";
import { createTestAcc } from "../test_data";
import { stringify } from "common/util/funs";

export const createSignature = (
  cert: Certificate,
  cas: string[],
  ils: string,
  audit: boolean
) => {
  const acc = createTestAcc(cert, cas.length + 2);
  const sig = `<x-${
    audit ? "audit" : "cert"
  }-signature id="sig" cas="${cas.join()}" ilses="${ils}">${stringify(
    acc
  )}</x-${audit ? "audit" : "cert"}-signature>`;
  return sig;
};
