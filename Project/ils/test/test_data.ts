import {
  ARPKICert,
  PublisherCertificate,
  ApplicationCertificate,
  AuditionCertificate,
  CertificateType,
  MultiSignature
} from "common/certs/types";
import { ILS, CA, Publisher } from "common/participants/types";
import { getHash, stringify } from "common/util/funs";
import { Request, Response } from "common/communication/types";
import { CryptoKey } from "common/crypto/types";
import { LogRootV1, MapRootV1 } from "common/trillian/types";
import { GetRequest } from "common/communication/requests/Get";
import { sign } from "common/crypto/rsa";
import { cloneDeep } from "lodash";
import {
  SynchronizationAcknowledge,
  SynchronizationResponse,
  SynchronizationRequest,
  SynchronizationCommit
} from "common/communication/requests/Synchronization";
import { RegistrationRequest } from "common/communication/requests/Registration";
import { UpdateRequest } from "common/communication/requests/Update";
import { DeleteRequest } from "common/communication/requests/Delete";
import { AuditRequest } from "common/communication/requests/Audit";

export const createTestAcc = (obj: any, parties: number) => {
  let acc: MultiSignature = { signature: sign(obj, PRIVATE_KEY) };
  for (let i = 0; i < parties - 1; i++) {
    const signature = sign(acc, PRIVATE_KEY);
    acc = { data: cloneDeep(acc), signature };
  }
  return acc;
};

export type ARPKIPublisherCert = ARPKICert<PublisherCertificate>;
export type ARPKIApplicationCert = ARPKICert<ApplicationCertificate>;
export type ARPKIAuditCert = ARPKICert<AuditionCertificate>;

export const emptyLogRoot: LogRootV1 = {
  Metadata: new Uint8Array(0),
  Revision: "0",
  RootHash: new Uint8Array(0),
  Signature: new Uint8Array(0),
  TimestampNanos: "0",
  TreeSize: "0"
};

export const emptyMapRoot: MapRootV1 = {
  LogRoot: emptyLogRoot,
  Revision: "0",
  RootHash: new Uint8Array(0),
  Signature: new Uint8Array(0),
  TimestampNanos: "0"
};

export const PRIVATE_KEY: CryptoKey = {
  data:
    "-----BEGIN RSA PRIVATE KEY-----" +
    "MIIEpQIBAAKCAQEApcG5/Wf7Cb8T/VMaktn7oVkJwb/w56FAbQfLF/2j3/Sn40xf\n" +
    "K6R/zogPRqCsoBhXlEUR+cjLs1DPla0YGITEDjj5QHmvmPacM9EaewX1ED3qpZpq\n" +
    "pqvx0QSh2TUqUbPU59j83tg/aBbuAIiqcuHzfPZp4sx98NhET0C9Yf1k9Pb5jEZj\n" +
    "3HjcxYfvb17wcyvQ5NkVoi/82P2kVoIf4AlsWkbB2XQY6ztIm/cUv1tLr6MaCALx\n" +
    "ird4vaYPHJ7mp0Te7PBFpDQn5g3O650uziiCrLDCHfvXeZLgwso6hKjzlMwaBpDl\n" +
    "drpHTJIaoTXdH1XRQUnUN+2aGZ78tIJ9hh7lIwIDAQABAoIBAH9e9kS7ejRrGDk5\n" +
    "etoNl0bM3Kp9i+jyCEfADVhKF3sozTnknd0zcuKJuvNS1FPRYLsWuFFw8ta/6kPh\n" +
    "1vpAS0eCkEXzO/QWzMEklWyjj0UDzyOiHQImbpNnM9ds+y/9OEVQgD/dfBvIQus2\n" +
    "GYReDHSiBYu6B6zjAtrDrMN3q/Rv94yHMAMnz+VZiuS3QZzySgeyBABjrIfgKIZ7\n" +
    "EfP/nr+d+5ClYc4zZkjanvNHMCcRNJIQFUdRBlfJPOz2ZlCdagfmgrUzST/DQiAY\n" +
    "LuZf9kNQfZxmQUSyCp2c12SyldnMjdOl7/VXgyBc3h+esUK1dViau3pCXmM6A/b+\n" +
    "ddN8MgECgYEAzpEGzOaIWMeEYliVv/yoE8ybMzX1Hn8F6WE16gqiypTOiJgwIUAF\n" +
    "13HB3QGuAlGUSoQF4b/ZvTldIGKPAQxiRMouGPMqxEgZKDzWqJ2wWG9gzbAM7636\n" +
    "eNmsWsBff6qK9IOicIHQroSlO049rL9M0CIqbSJyny2ZSEyOFGggT4MCgYEAzWyN\n" +
    "up0p9nwdk6+aL8APzTq/ZARTsPLkp8UrjWUR8ugDP6WLxfSLwXYBxlSvBJFAPlEr\n" +
    "6eTHnxYUNDIN2MzDzbcmfL8TufqILp25ZM8TxlgeS6K9gbSkZ/5jbiKAtOECw9Pr\n" +
    "4GH8Dq0A7dHJNsC1JfnUmE53URukOsPufUc4geECgYEAlJJJAt0Y2kn+lMHES4cM\n" +
    "2NjEFAxOFjYkaVyK65/kwLJQ7nwPugqTaQcf+ba4kmBcuU/F7z4O/QOiUKWy130x\n" +
    "vOpyR222p+B3f7JqbnKkoKbTSH3EgCtxSLS/O7K7vVZLhVycXDFyh+NN+J7oyzP4\n" +
    "qoa4XzB0orqoUhEF6/WMr8MCgYEAwWAHxvz9rI9H1GfAsGSPO3WrBz7ffboYryn3\n" +
    "hqH3FH9912NCQXWkPdiVcRr0qksFe+Qzf3kixUomeMAJsuWHCNb5PwMsUa1alu9Y\n" +
    "v2IDznnTAwZOeJQRE+gvt1R5bkxGqwuKhu4WNcZ8EmOik40yuW4Fx95NiaeIoN0i\n" +
    "WwI5WmECgYEAw1uyW6U9iQh7SOsyS/2kgeUtUZhnFcpxHHzr63yq+u6QZtMfQjn0\n" +
    "ZMZdxhaBxZi6TsdH7w+XJvpx3zGdDfYku1X0L+hpdSuH6szYckfXcWWwIcdlCPVK\n" +
    "3V5WSYAg7tf3CFUlcguXkQg9rTCdW46eD4hOsYpwYXyo6jHh3n59PwU=\n" +
    "-----END RSA PRIVATE KEY-----",
  format: "private"
};

export const PUBLIC_KEY: CryptoKey = {
  data:
    "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApcG5/Wf7Cb8T/VMaktn7\n" +
    "oVkJwb/w56FAbQfLF/2j3/Sn40xfK6R/zogPRqCsoBhXlEUR+cjLs1DPla0YGITE\n" +
    "Djj5QHmvmPacM9EaewX1ED3qpZpqpqvx0QSh2TUqUbPU59j83tg/aBbuAIiqcuHz\n" +
    "fPZp4sx98NhET0C9Yf1k9Pb5jEZj3HjcxYfvb17wcyvQ5NkVoi/82P2kVoIf4Als\n" +
    "WkbB2XQY6ztIm/cUv1tLr6MaCALxird4vaYPHJ7mp0Te7PBFpDQn5g3O650uziiC\n" +
    "rLDCHfvXeZLgwso6hKjzlMwaBpDldrpHTJIaoTXdH1XRQUnUN+2aGZ78tIJ9hh7l\n" +
    "IwIDAQAB\n" +
    "-----END PUBLIC KEY-----",
  format: "public"
};

const nonce = 1;
export const NONCE = (participants: number) => ({
  nonce,
  nonceSignature: createTestAcc(nonce, participants)
});

const synResAttr = (req: SynchronizationRequest<ARPKIPublisherCert>) => ({
  type: "SynchronizationResponse",
  request: req as SynchronizationRequest<ARPKIPublisherCert>,
  hash: getHash((req as SynchronizationRequest<ARPKIPublisherCert>).request),
  nonce: 1
});
const synAckAttr = (req: SynchronizationCommit) => ({
  type: "SynchronizationAcknowledge",
  request: req as SynchronizationCommit,
  root: stringify(emptyMapRoot),
  rootSignature: {
    signature: sign(emptyMapRoot, PRIVATE_KEY)
  },
  consistencyProof: "",
  consistencyProofSignature: "",
  logProof: "",
  logProofSignature: "",
  mapProof: "",
  mapProofSignature: "",
  acceptanceConfirmation: {
    data: req.acceptanceConfirmation,
    signature: sign(req.acceptanceConfirmation, PRIVATE_KEY)
  },

  nonce: 1
});
export const send = (_: string, req: Request | Response) => {
  switch (req.type) {
    case "SynchronizationRequest": {
      const attrs = synResAttr(req as SynchronizationRequest<
        ARPKIPublisherCert
      >);
      return Promise.resolve<SynchronizationResponse<ARPKIPublisherCert>>({
        ...attrs,
        type: "SynchronizationResponse",
        nonceSignature: {
          signature: sign(attrs, PRIVATE_KEY)
        }
      });
    }
    case "SynchronizationCommit": {
      const attrs = synAckAttr(req as SynchronizationCommit);
      return Promise.resolve<SynchronizationAcknowledge>({
        ...attrs,
        type: "SynchronizationAcknowledge",
        nonceSignature: {
          signature: sign(attrs, PRIVATE_KEY)
        }
      });
    }
    default:
      return Promise.resolve();
  }
};

export const publisher1: Publisher = {
  publicKey: PUBLIC_KEY,
  send,
  type: "publisher",
  url: "publisher.url"
};

export const ils1: ILS = {
  publicKey: PUBLIC_KEY,
  type: "ils",
  url: "ils.com",
  send,
  trees: []
};

export const ils2: ILS = {
  publicKey: PUBLIC_KEY,
  type: "ils",
  url: "ils2.com",
  send,
  trees: []
};

export const ca1: CA = {
  publicKey: PUBLIC_KEY,
  send,
  type: "ca",
  url: "ca.url"
};

export const ca2: CA = {
  publicKey: PUBLIC_KEY,
  send,
  type: "ca",
  url: "ca2.url"
};

export const queryParticipant = (url: string) => {
  let p;
  switch (url) {
    case publisher1.url:
      p = publisher1;
      break;
    case ils1.url:
      p = ils1;
      break;
    case ils2.url:
      p = ils2;
      break;
    case ca1.url:
      p = ca1;
      break;
    case ca2.url:
      p = ca2;
      break;
  }
  return Promise.resolve(p);
};

const pubCert1Base = {
  type: "PublisherCertificate",
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  expectedLifetime: 8640000000000000,
  domains: ["url"],
  subject: "publisher",
  subjectPublicKey: PUBLIC_KEY,
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  },
  version: 1
};

export const publisherCert1: ARPKICert<PublisherCertificate> = {
  ...pubCert1Base,
  signatures: [sign(pubCert1Base, PRIVATE_KEY), sign(pubCert1Base, PRIVATE_KEY)]
} as ARPKICert<PublisherCertificate>;

const appCert1RawBase = {
  type: "ApplicationCertificate" as CertificateType,
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  publisher: {
    acceptanceConfirmation: createTestAcc(publisherCert1, 3),
    ...publisherCert1
  },
  applicationUrl: "url",
  deploymentVersion: 1,
  resources: [
    {
      contentHash:
        "RB+baqSVWwJ6p/ePcefT6c9pS0bz72Nt4A0teYVFueTc13ZKG4MgvmMS1malw4FJk5f1IE2dfjkSLHSo9ijnERmMbxxb//y0ch6raCNdcsoduzdiqSKB2lsSsxvVxnyddUi75S6E2IoUEomzzFw1QLbzlOBa/2/O9RE+2nXZPsguN+lSiA6FC25En1555WHJJH0WBng4zakxKGUrKTaDJ9+CRuLgkT9BPzMJH0ORZoME2oInxyXKjLc1Vr/QATLTlKyYoxJZqu42Ag96FICzbMKEOv79gx0pisz/NuxImp8gryuzz6ksEBHlSDCITupcvslGXnIWOt7sQ5sneip5mQ==",
      resourceUrl: "http://resource.com"
    }
  ],
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  }
};

const appCert1Base = {
  ...appCert1RawBase,
  signature: sign(appCert1RawBase, PRIVATE_KEY)
};

export const applicationCert1: ARPKICert<ApplicationCertificate> = {
  ...appCert1Base,
  signatures: [sign(appCert1Base, PRIVATE_KEY), sign(appCert1Base, PRIVATE_KEY)]
} as ARPKICert<ApplicationCertificate>;

const pubCert2Base = {
  type: "PublisherCertificate",
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  expectedLifetime: 8640000000000000,
  domains: ["url2"],
  subject: "publisher2",
  subjectPublicKey: { data: "5678", format: "public" },
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  },
  version: 2
};

export const publisherCert2: ARPKICert<PublisherCertificate> = {
  ...pubCert2Base,
  signatures: [sign(pubCert2Base, PRIVATE_KEY), sign(pubCert2Base, PRIVATE_KEY)]
} as ARPKICert<PublisherCertificate>;

const pubCert12Base = {
  type: "PublisherCertificate",
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  expectedLifetime: 8640000000000000,
  domains: ["url2"],
  subject: "publisher",
  subjectPublicKey: { data: "5678", format: "public" },
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  },
  version: 2
};

export const publisherCert12: ARPKICert<PublisherCertificate> = {
  ...pubCert12Base,
  signatures: [
    sign(pubCert12Base, PRIVATE_KEY),
    sign(pubCert12Base, PRIVATE_KEY)
  ]
} as ARPKICert<PublisherCertificate>;

export const applicationCert2: ARPKICert<ApplicationCertificate> = {
  type: "ApplicationCertificate",
  caMin: 1,
  cas: ["ca2.url"],
  ilses: ["ils2.com"],
  signatures: [],
  publisher: {
    acceptanceConfirmation: createTestAcc(publisherCert2, 3),
    ...publisherCert2
  },
  applicationUrl: "url2",
  deploymentVersion: 1,
  resources: [
    {
      contentHash: "0",
      resourceUrl: "http://resource2.com"
    }
  ],
  signature: "1",
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  }
};

export const auditCert1: ARPKICert<AuditionCertificate> = {
  type: "AuditionCertificate",
  caMin: 1,
  cas: ["ca.url"],
  ilses: ["ils.com"],
  signatures: [],
  auditor: {
    acceptanceConfirmation: createTestAcc(publisherCert2, 3),
    ...publisherCert2
  },
  application: applicationCert1.applicationUrl,
  applicationVersion: applicationCert1.deploymentVersion,
  methods: [],
  properties: [
    {
      description: "desc1",
      property: "prop1"
    }
  ],
  resources: [
    {
      contentHash: "0",
      resourceUrl: "http://resource.com"
    }
  ],
  signature: "0",
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  }
};

export const auditCert2: ARPKICert<AuditionCertificate> = {
  type: "AuditionCertificate",
  caMin: 1,
  cas: ["ca2.url"],
  ilses: ["ils2.com"],
  signatures: [],
  auditor: {
    acceptanceConfirmation: createTestAcc(publisherCert1, 3),
    ...publisherCert1
  },
  application: applicationCert2.applicationUrl,
  applicationVersion: applicationCert2.deploymentVersion,
  methods: [],
  properties: [
    {
      description: "desc2",
      property: "prop2"
    }
  ],
  resources: [
    {
      contentHash: "0",
      resourceUrl: "http://resource2.com"
    }
  ],
  signature: "1",
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  }
};

const regReqAttrs = {
  cert: publisherCert1,
  type: "RegistrationRequest",
  nonce: 1
};
export const regRequest: RegistrationRequest<ARPKIPublisherCert> = {
  ...regReqAttrs,
  type: "RegistrationRequest",
  signature: sign(regReqAttrs, PRIVATE_KEY)
};

const regReq12Attrs = {
  cert: publisherCert12,
  type: "RegistrationRequest",
  nonce: 1
};
export const regRequest12: RegistrationRequest<ARPKIPublisherCert> = {
  ...regReq12Attrs,
  type: "RegistrationRequest",
  signature: sign(regReq12Attrs, PRIVATE_KEY)
};

const regReq1Attrs = {
  cert: applicationCert1,
  type: "RegistrationRequest",
  nonce: 1
};
export const regRequest1: RegistrationRequest<ARPKIApplicationCert> = {
  ...regReq1Attrs,
  type: "RegistrationRequest",
  signature: sign(regReq1Attrs, PRIVATE_KEY)
};

const regReq3Attrs = {
  cert: publisherCert2,
  type: "RegistrationRequest",
  nonce: 1
};
export const regRequest3: RegistrationRequest<ARPKIPublisherCert> = {
  ...regReq3Attrs,
  type: "RegistrationRequest",
  signature: sign(regReq3Attrs, PRIVATE_KEY)
};

const updReqAttrs = {
  cert: publisherCert2,
  type: "UpdateRequest",
  nonce: 1
};
export const updateRequest: UpdateRequest<ARPKIPublisherCert> = {
  ...updReqAttrs,
  type: "UpdateRequest",
  signature: sign(updReqAttrs, PRIVATE_KEY)
};

const updReq1Attrs = {
  cert: publisherCert12,
  type: "UpdateRequest",
  nonce: 1
};
export const updateRequest1: UpdateRequest<ARPKIPublisherCert> = {
  ...updReq1Attrs,
  type: "UpdateRequest",
  signature: sign(updReq1Attrs, PRIVATE_KEY)
};

const synReqAttrs = {
  request: regRequest,
  nonce: 1,
  type: "SynchronizationRequest"
};
export const syncRequest: SynchronizationRequest<ARPKIPublisherCert> = {
  ...synReqAttrs,
  type: "SynchronizationRequest",
  signature: sign(synReqAttrs, PRIVATE_KEY)
};

const synConAttrs = {
  hash: getHash(regRequest),
  type: "SynchronizationCommit",
  acceptanceConfirmation: {
    signature: sign(regRequest, PRIVATE_KEY)
  },
  nonce: 1
};
export const syncCommit: SynchronizationCommit = {
  ...synConAttrs,
  type: "SynchronizationCommit",
  signature: sign(synConAttrs, PRIVATE_KEY)
};

const delReqAttrs = {
  cert: publisherCert1,
  type: "DeleteRequest",
  nonce: 1
};
export const deleteRequest: DeleteRequest<ARPKIPublisherCert> = {
  ...delReqAttrs,
  type: "DeleteRequest",
  signature: sign(delReqAttrs, PRIVATE_KEY)
};

const delReq1Attrs = {
  cert: applicationCert1,
  type: "DeleteRequest",
  nonce: 1
};
export const deleteRequest1: DeleteRequest<ARPKIApplicationCert> = {
  ...delReq1Attrs,
  type: "DeleteRequest",
  signature: sign(delReq1Attrs, PRIVATE_KEY)
};

export const getRequest: GetRequest = {
  certType: "PublisherCertificate",
  cas: ["ca.url", "ca2.url"],
  domain: publisherCert1.subject,
  ils: "ils.com",
  type: "GetRequest",
  nonce: 1
};

export const getRequest1: GetRequest = {
  certType: "ApplicationCertificate",
  cas: ["ca.url", "ca2.url"],
  ils: "ils.com",
  domain: applicationCert1.applicationUrl,
  type: "GetRequest",
  nonce: 1
};

export const auditRequest: AuditRequest = {
  cas: ["ca.url", "ca2.url"],
  certType: "PublisherCertificate",
  sinceRevision: "0",
  ils: "ils.com",
  type: "AuditRequest",
  nonce: 1
};
