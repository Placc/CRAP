import { Certificate } from "common/certs/types";
import { ARPKICertStorage } from "../storage/types";
import { Participant, CA, ILS } from "common/participants/types";
import { sign } from "common/crypto/rsa";
import { CryptoKey } from "common/crypto/types";
import { stringify } from "common/util/funs";
import { GetRequest, GetResponse } from "common/communication/requests/Get";

export const processGetRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  sender: CA,
  request: GetRequest,
  requester: Participant
): Promise<void> => {
  const cas = (await Promise.all(
    request.cas.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const inclusion = await storage.getVerifiable(request.domain);
  const proofSignature = sign(inclusion.proof, privateKey);
  const rootSignature = sign(inclusion.root, privateKey);

  if (
    inclusion.cert &&
    !request.cas.every(ca => inclusion.cert!.cas.some(certCa => certCa == ca))
  ) {
    throw new Error("Illegal cas list!");
  }

  const rawResponse = {
    type: "GetResponse",
    request,
    cert: inclusion.cert,
    proof: stringify(inclusion.proof),
    proofSignature,
    root: stringify(inclusion.root),
    rootSignature: {
      signature: rootSignature
    },
    nonce: request.nonce
  };

  const response: GetResponse<C> = {
    ...rawResponse,
    type: "GetResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  const remainingIndex = request.cas.length - 1;
  if (remainingIndex > 0) {
    await cas[remainingIndex].send("get", response, requester);
  } else {
    await sender.send("get", response, requester);
  }
};
