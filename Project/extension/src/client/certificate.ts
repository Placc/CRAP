import {
  GetRequest,
  GetResponse,
  isGetResponse
} from "common/communication/requests/Get";
import { CreateNonce, stringify, getTreeIdForCertType } from "common/util/funs";
import { head } from "lodash";
import {
  Certificate,
  ARPKICert,
  CertificateType,
  ApplicationCertificate,
  AuditionCertificate
} from "common/certs/types";
import { CA, ILS, TreeType, Participant } from "common/participants/types";
import { verifySignatures, verifyProof } from "./verification";
import { parseMapLeafInclusion, parseMapRoot } from "common/trillian/parse";
import { DOMSignature } from "./types";
import {
  verifyAcceptanceConfirmation,
  verifyMultiSignature
} from "common/certs/verification";
import { CertificateCache } from "./cache";
import { CryptoKey } from "common/crypto/types";

const verifyResponse = async <C extends Certificate>(
  ils: ILS,
  cas: CA[],
  certType: CertificateType,
  domain: string,
  response: GetResponse<C>
) => {
  await verifySignatures(response, cas, ils);

  const proof = parseMapLeafInclusion(response.proof);
  const root = parseMapRoot(response.root);

  const treeId = getTreeIdForCertType(ils.trees, certType, TreeType.MAP)!;

  await verifyProof(treeId, root, proof, domain, response.cert);
};

export const queryCertificate = async <C extends Certificate>(
  certType: CertificateType,
  domain: string,
  cas: CA[],
  ils: ILS
): Promise<GetResponse<C>> => {
  const getRequest: GetRequest = {
    certType,
    domain,
    nonce: CreateNonce(),
    type: "GetRequest",
    cas: cas.map(ca => ca.url),
    ils: ils.url
  };

  const mainCA = head(cas)!;
  const response = await mainCA.send("get", getRequest);

  if (!isGetResponse<C>(response)) {
    throw new Error("CA response is not a GetResponse!");
  }

  if (getRequest.nonce != response.nonce) {
    throw new Error("Response nonce does not match request nonce!");
  }

  return response;
};

const getSubjectPublicKey = (cert: Certificate): CryptoKey => {
  switch (cert.type) {
    case "ApplicationCertificate":
      return cert["publisher"].subjectPublicKey;
    case "AuditionCertificate":
      return cert["auditor"].subjectPublicKey;
    case "PublisherCertificate":
      return cert["subjectPublicKey"];
  }
};

export const getVerifiedCertificate = async <C extends Certificate>(
  domain: string,
  certType: CertificateType,
  domSignature: DOMSignature,
  queryParticipant: (url: string) => Promise<Participant>
): Promise<ARPKICert<C>> => {
  const cache = CertificateCache<C>(certType);
  const cachedCert = cache.get(domain);
  if (cachedCert) {
    return cachedCert;
  }

  const cas = (await Promise.all(
    domSignature.cas.map(async ca => await queryParticipant(ca))
  )) as CA[];
  const ilses = (await Promise.all(
    domSignature.ilses.map(async ils => await queryParticipant(ils))
  )) as ILS[];
  const ils = ilses[Math.floor(Math.random() * domSignature.ilses.length)];
  const response = await queryCertificate<C>(certType, domain, cas, ils);

  await verifyResponse(ils, cas, certType, domain, response);

  const certificate = response.cert;

  if (!certificate) {
    throw new Error("No certificate registered!");
  }
  if (
    !certificate.cas.every(ca => domSignature.cas.some(sigCa => sigCa == ca)) ||
    !certificate.ilses.every(ils =>
      domSignature.ilses.some(sigIls => sigIls == ils)
    )
  ) {
    throw new Error("Invalid signature attributes!");
  }

  const invalidAppAuditCert =
    certType != "PublisherCertificate" &&
    !verifyAcceptanceConfirmation(
      certificate,
      domSignature.acceptanceConfirmation,
      cas,
      ilses,
      getSubjectPublicKey(certificate)
    );

  if (invalidAppAuditCert) {
    throw new Error("Invalid certificate acceptance confirmation!");
  }

  cache.set(domain, certificate);

  return certificate;
};
