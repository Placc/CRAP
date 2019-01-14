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
import { sign } from "common/crypto/rsa";
import { cloneDeep } from "lodash";
import { GenerateRequest } from "common/communication/requests/Generate";
import {
  ModificationRequest,
  ModificationResponse
} from "common/communication/requests/Modification";
import { TEST_REQUEST_HOLDER } from "./util";
import { GetRequest, GetResponse } from "common/communication/requests/Get";
import {
  AuditRequest,
  AuditResponse
} from "common/communication/requests/Audit";
import { BuildLogLeaf } from "common/trillian/util";
import { Operation } from "common/trillian/entry/entry_pb";
import {
  DeleteRequest,
  DeleteResponse
} from "common/communication/requests/Delete";
import {
  UpdateRequest,
  UpdateResponse
} from "common/communication/requests/Update";
import {
  RegistrationRequest,
  RegistrationResponse
} from "common/communication/requests/Registration";
import { RootResponse } from "common/communication/requests/Root";

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

export const send = (_: string, req: Request | Response) => {
  switch (req.type) {
    case "RegistrationRequest":
      TEST_REQUEST_HOLDER.notifyResult(req, regResponse);
      return Promise.resolve(regResponse);
    case "GetRequest":
      TEST_REQUEST_HOLDER.notifyResult(req, getResponse);
      return Promise.resolve(getResponse);
    case "AuditRequest":
      TEST_REQUEST_HOLDER.notifyResult(req, auditResponse);
      return Promise.resolve(auditResponse);
    case "UpdateRequest":
      TEST_REQUEST_HOLDER.notifyResult(req, updateResponse);
      return Promise.resolve(updateResponse);
    case "DeleteRequest":
      TEST_REQUEST_HOLDER.notifyResult(req, deleteResponse);
      return Promise.resolve(deleteResponse);
    case "RootRequest":
      const res = emptyRootResponse(req);
      TEST_REQUEST_HOLDER.notifyResult(req, res);
      return Promise.resolve(res);
    default:
      return Promise.resolve(); //Promise.reject("test-data send");
  }
};

export const NONCE = (data: any, participants: number) => ({
  nonceSignature: createTestAcc(data, participants)
});

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
  trees: [
    {
      ContentType: 0,
      PublicKey: new Uint8Array(0),
      TreeId: "7807276831776821670",
      TreeType: 2
    }
  ]
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
  cas: ["ca.url"],
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

const genReq1Attrs = {
  cert: pubCert1Base as Partial<ARPKICert<PublisherCertificate>>,
  type: "GenerateRequest",
  nonce: 1
};
export const generateRequest1: GenerateRequest<PublisherCertificate> = {
  ...genReq1Attrs,
  type: "GenerateRequest",
  signature: sign(genReq1Attrs, PRIVATE_KEY)
};

const genReq2Attrs = {
  cert: appCert1Base as Partial<ARPKICert<ApplicationCertificate>>,
  type: "GenerateRequest",
  nonce: 1
};
export const generateRequest2: GenerateRequest<ApplicationCertificate> = {
  ...genReq2Attrs,
  type: "GenerateRequest",
  signature: sign(genReq2Attrs, PRIVATE_KEY)
};

const regRespAttr = {
  type: "RegistrationResponse",
  acceptanceConfirmation: createTestAcc(publisherCert1, 1),
  acknowledgements: [],
  request: regRequest,
  consistencyProof: '{"hashesList":[],"leafIndex":"0"}',
  consistencyProofSignature:
    "oyC/zpYVb6sBlXwt5+Z+uSPWuunVnr8JtAAAmKlPWuYYytzyABLt9OeSU15ZVeuV0VXPBkswQjJkge6ib+jA1EiHegIXEK24WfwEpPO34GWPJsO+yNMxdqujVNf30vRzP4wqfEDTjWp+qTmdhMIWgPIzC2Ln8j+YnksPkKhkEMrG9DccT/T+XAL2tnE6bfoCUYX3wXLdMVLCrab0ecr2KEiCuS911WVELxGSUuAzv4XG4vWEtOhLG1zkhjOGfkxiU7/rAw4O6O7vDp0NGwKyFKhpNAyK0Wqg+0glyEjf4nMyv4C81AuPlr8PVpyVdcTOZEJxSyrtsErP8yutCnfvUg==",
  logProof: '[{"hashesList":[],"leafIndex":"0"}]',
  logProofSignature:
    "Ll7IJ225YtIvLQfhxtgDz8hgJy5vW3cAtDDZWVwRcYHPfMmiQNX6jo0Yt6TbqM4uaqu3c0i5V5JA1TWxoGDLPWESqBRHuKARRU2zpydr/3iqKFZSnSUgQc74MECMAgcE3o9h9Ej84YSUxEr+3873HROyNin5W/VOp3fdSVH0T/PUwQLwbgvKIRG76vvvnDelwtu+X4InN0UjHHSo+EjWCYQHrPcsFf8Ad44Ed7Bo5Au3X8AZEoLrz2nRoP/WbISuEfJjc3T7NIVR1oVWKuXL/J1oUqET23pHzY6o+3YSlnxpUUu7qP/kp71bhYX7bJwthmb5ZkgWgJEcS6ty+fpXvQ==",
  mapProof:
    '{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"Yz5ubjjv6V42ZV3EqMC+Iq5Wyv4rHCni1XzAE2MpnCw=","leafValue":"CglwdWJsaXNoZXIStwt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJleHBlY3RlZExpZmV0aW1lIjo4NjQwMDAwMDAwMDAwMDAwLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiazlDUkRKU2REaHQzMzRndjBGOTVZUi85YkJyZC94T0dkVzAzcjI5ZW41THdBM1ZENi9PdGdQN2ZuZ05WR3pIcSt3ZmpZNzFqTmR1Nmt1VEF2bWUxQVVaNlVYaWlUZHNNV2hLdXQzdnd5SWdtMHFNZU5zUE0ycG5wd05WSzhXeEVlN0NxRnNvR1BYSXhIUE0wZ25SWnA4QjZFZ1JUQWcvQ3RTL2IrV2pKdWNKNmVrakg4eDQrVXV5TVVvQkdNNzVNNEhsOGxoVkYxSHM4M1NSdHpzV3dYM3c4cE91bFQweWZDY0JRN3Z2MVJEZk1sYitvYWp4Z2FuQitxaCtvNWFiVysrQ1ZTR3BNWDI1R242T3JpWkVSY2FCRzROd2FRZGt1UjhvTlZLNkNXczJ4UER2aS9HTXp5ZnpWajYwdWZNMnVkSE5Eb1hxWURZOWhjOExKc3pwaHpRPT0iLCJrOUNSREpTZERodDMzNGd2MEY5NVlSLzliQnJkL3hPR2RXMDNyMjllbjVMd0EzVkQ2L090Z1A3Zm5nTlZHekhxK3dmalk3MWpOZHU2a3VUQXZtZTFBVVo2VVhpaVRkc01XaEt1dDN2d3lJZ20wcU1lTnNQTTJwbnB3TlZLOFd4RWU3Q3FGc29HUFhJeEhQTTBnblJacDhCNkVnUlRBZy9DdFMvYitXakp1Y0o2ZWtqSDh4NCtVdXlNVW9CR003NU00SGw4bGhWRjFIczgzU1J0enNXd1gzdzhwT3VsVDB5ZkNjQlE3dnYxUkRmTWxiK29hanhnYW5CK3FoK281YWJXKytDVlNHcE1YMjVHbjZPcmlaRVJjYUJHNE53YVFka3VSOG9OVks2Q1dzMnhQRHZpL0dNenlmelZqNjB1Zk0ydWRITkRvWHFZRFk5aGM4TEpzenBoelE9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ=="}}',
  mapProofSignature:
    "AN8F2Y+8B/X23uyBZ8sYPITq6JKAXzjhBAE0EaWecCwrTTJyjlwL9Wr5edfq6MzIoIsnvPaqKMHQnPqvAWyzC+jhMJUSBhOugyomL7MrMM7PsjoHDvYJUMRZXa0j6RoAA9pNTiSKfED0YDlbaWL4ExCNz7k68bqBuRt7rlnfjdjmbd2tIiyew2Wh55z/PgMa1+gOzJDJF65/jWjRexPu45yksJA87AkafV8nIZMXPuit3g0wTBheFTtSFKEAo4XdRdOVSuYNduXrznwR/4KrypbIS3I47F3f5fg70dXsjnqHYhlXUiKLfETA78ITpvLDXuoCC55kbVH19NP17Vb4UQ==",
  root:
    '{"LogRoot":{"Metadata":"","Revision":"1","RootHash":"QhjUyHXhr4/Po/PiLGulvVZh3MZYI087EnN7L3CDZ9E=","Signature":"uFNk7fcRtwVXPIl2rqX4hnlUgzwqtSQJKV8S07G6XguLYs57pTnS4Gp+gEKUo/Z8AOVUlGcjdTh4Bp3XdGU/oThAz2nV01JMZq7xFeFUSCNQtx7wIaT3jSeEsjtxym+T1UBCcXxps58PssfINN5vXIEFN7S/T503YAYHZVwOaM95Fr4ZLCSaJLj903k3XZ6pwJe4Yo+KBgo0WqfVQ0D2FhijbQCe1f74/ykOBA+RCA4lbSZtbeYLrNFtLhGat8TnCKrLi3IjflQEwp8qHM6HvqgkaR4wyfaPxofmsSUhDUb++S+ENL64zz4nvLoojWyE7f7w9Coq9WDaGp/IWz3pog==","TimestampNanos":"1546969273377673700","TreeSize":"1"},"Revision":"1","RootHash":"KFWrFwKbDCASC80i3QSrYynC2wiVisr3SWYrDaTj+io=","Signature":"RDanBnBb1PTC66yiQO0Ibp2abc2zVoqXCA5tNip8+6NtkmDaPBv1kXZWjNXtxCdQDm9suVI+Xhl0EWo4GQJxD3CJg+fvHIKmms2nZ39QXtCbTokpVQYpI/rvC2dDa4mr4YiTr5pvkMtSqGCgWunlY/EQ/Lzma/30tp7JvjHA50OsOk9SAzav48NZSzQYKxBV/qcV2PvzTEZtdGtPwJuhvf5LVm0c2EWWyOsogMKHtqo61fHpVpLaCkgDCb0gx8y4D7MvuaSkW5vl30MpX6Fp0Ub/DW6SB4HT5W1UpC0YGjfFc/nDL4cWSWhISpgUonUvvfDGzeo90r/EyIstM+zRlw==","TimestampNanos":"1546969280111183800"}',
  rootSignature: {
    signature:
      "PtbNDgB1K7PdaUvwcQBqLGM5ikCd3NxOlT9FU8ZP45Xew6MR8gDVbIuQxTOsmm1Jx8WTEtYR18J5/9eeYL5ZsLD/L0q3YarPD7fadiDmrOs4Lpfh6B5CrhHPL/xMnjD3NvBbkUhEXGQ6z0HP0+xqmK40s+D95JE6WLBNaV1/tDXS4tLc6NuITLAwBFBIakRGZUddjswG5ogpymD2K52dn8PLnMqBLEhd5baOwiuxXMJ5cMxb5AHsFqMCziz8XjzZCs0RL6oJRd3hRdA5TyNamaFos25a1JwyBVPkD1vweJYbtgcmCzOihkrztPC8Lic1jvplZouhlnOdj8Z6wcQFHw=="
  },
  nonce: 1
};
export const regResponse: RegistrationResponse<PublisherCertificate> = {
  ...regRespAttr,
  type: "RegistrationResponse",
  ...NONCE(regRespAttr, 1)
};

const getRespAttr = {
  cert: publisherCert1,
  request: getRequest,
  proof: regResponse.mapProof,
  proofSignature: regResponse.mapProofSignature,
  root: regResponse.root,
  rootSignature: regResponse.rootSignature,
  type: "GetResponse",
  nonce: 1
};
export const getResponse: GetResponse<PublisherCertificate> = {
  ...getRespAttr,
  type: "GetResponse",
  ...NONCE(getRespAttr, 1)
};

const publisherLogLeaf = BuildLogLeaf(
  publisherCert1.subject,
  stringify(publisherCert1),
  Operation.CREATE
).toObject();
const auditLeavesArray = [publisherLogLeaf];
const audRespAttr = {
  consistencyProof: regResponse.consistencyProof,
  consistencyProofSignature: regResponse.consistencyProofSignature,
  logProofs: `[${regResponse.logProof}]`,
  logProofsSignature: sign([JSON.parse(regResponse.logProof)], PRIVATE_KEY),
  mapProofs: `[${regResponse.mapProof}]`,
  mapProofsSignature: sign([JSON.parse(regResponse.mapProof)], PRIVATE_KEY),
  root: regResponse.root,
  rootSignature: regResponse.rootSignature,
  request: auditRequest,
  type: "AuditResponse",
  leaves: stringify(auditLeavesArray),
  leavesSignature: sign(auditLeavesArray, PRIVATE_KEY),
  nonce: 1
};
export const auditResponse: AuditResponse = {
  ...audRespAttr,
  type: "AuditResponse",
  ...NONCE(audRespAttr, 1)
};

export const deleteResponse: DeleteResponse<ARPKIPublisherCert> = {
  ...regResponse,
  request: deleteRequest,
  type: "DeleteResponse"
};

export const updateResponse: UpdateResponse<ARPKIPublisherCert> = {
  ...regResponse,
  request: updateRequest1,
  type: "UpdateResponse"
};

export const emptyRootResponse = (request): RootResponse => {
  const resp = {
    cas: ["ca.url"],
    consistencyProof: '{"hashesList":[],"leafIndex":"0"}',
    nonce: 1,
    request,
    root: stringify(emptyMapRoot),
    type: "RootResponse"
  };

  return {
    ...resp,
    type: "RootResponse",
    nonceSignature: {
      signature: sign(resp, PRIVATE_KEY)
    }
  };
};
