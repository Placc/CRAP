import { Certificate, CertificateType } from "common/certs/types";
import { Participant, CA, ILS } from "common/participants/types";
import { ARPKICertStorage } from "../storage/types";
import { CryptoKey } from "common/crypto/types";
import { sign } from "common/crypto/rsa";
import { stringify } from "common/util/funs";
import { verifyParticipants, CA_MIN } from "common/certs/verification";
import {
  AuditRequest,
  AuditResponse
} from "common/communication/requests/Audit";

export const processAuditRequest = <C extends Certificate>(
  ils: ILS,
  privateKey: CryptoKey,
  storage: ARPKICertStorage<C>,
  queryParticipant: (url: string) => Promise<Participant>
) => async (
  sender: CA,
  request: AuditRequest,
  requester: Participant
): Promise<void> => {
  verifyParticipants(ils, CA_MIN, request, request);

  const cas = (await Promise.all(
    request.cas.map(async ca => await queryParticipant(ca))
  )) as CA[];

  const auditProof = await storage.audit(request.sinceRevision);

  const leavesSignature = sign(auditProof.leaves, privateKey);
  const logProofsSignature = sign(auditProof.logProofs, privateKey);
  const consistencyProofSignature = sign(
    auditProof.consistencyProof,
    privateKey
  );
  const mapProofsSignature = sign(auditProof.mapProofs, privateKey);
  const rootSignature = sign(auditProof.root, privateKey);

  const rawResponse = {
    type: "AuditResponse",
    leaves: stringify(auditProof.leaves),
    logProofs: stringify(auditProof.logProofs),
    consistencyProof: stringify(auditProof.consistencyProof),
    mapProofs: stringify(auditProof.mapProofs),
    root: stringify(auditProof.root),
    leavesSignature,
    logProofsSignature,
    consistencyProofSignature,
    mapProofsSignature,
    rootSignature: {
      signature: rootSignature
    },
    nonce: request.nonce,
    request
  };
  const response: AuditResponse = {
    ...rawResponse,
    type: "AuditResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  const remainingIndex = request.cas.length - 1;
  if (remainingIndex > 0) {
    await cas[remainingIndex].send("audit", response, requester);
  } else {
    await sender.send("audit", response, requester);
  }
};
