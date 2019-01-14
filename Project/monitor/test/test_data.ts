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
import { BuildLogLeaf } from "common/trillian/util";
import { Operation } from "common/trillian/entry/entry_pb";
import {
  RegistrationResponse,
  RegistrationRequest
} from "common/communication/requests/Registration";
import {
  GenerateRequest,
  GenerateResponse
} from "common/communication/requests/Generate";
import {
  AuditResponse,
  AuditRequest
} from "common/communication/requests/Audit";

export const createTestAcc = (obj: any, parties: number, skipIls?: boolean) => {
  let acc: MultiSignature = skipIls
    ? obj
    : { signature: sign(obj, PRIVATE_KEY) };
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
    case "AuditRequest":
      const { nonce, nonceSignature, ...res } =
        req["sinceRevision"] == "0" ? auditResponse : auditResponse2;
      const altered = alter({ ...res, nonce: req.nonce });
      return Promise.resolve(altered);
  }
  return Promise.resolve(); //Promise.reject("test-data send");
};

export const alter = (
  oldRes: Partial<AuditResponse>,
  attr?: string,
  value?: any
): AuditResponse => {
  const { nonce, nonceSignature, ...res } = cloneDeep(oldRes);
  if (attr) {
    res[attr] = value;
  }
  const rawRootSig = res.rootSignature!.data
    ? res.rootSignature!.data!.data!
    : res.rootSignature;
  const rawRes = { ...res, nonce, rootSignature: rawRootSig };
  const nn = NONCE(rawRes, 3);
  return {
    ...nn,
    ...rawRes,
    rootSignature: createTestAcc(rawRootSig, 3, true)
  } as AuditResponse;
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
      TreeId: "1128211144533431693",
      TreeType: 2
    },
    {
      ContentType: 1,
      PublicKey: new Uint8Array(0),
      TreeId: "1128211144533431693",
      TreeType: 2
    },
    {
      ContentType: 2,
      PublicKey: new Uint8Array(0),
      TreeId: "1128211144533431693",
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
  deploymentVersion: 0,
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

export const publisherCert2: ARPKICert<PublisherCertificate> = {
  type: "PublisherCertificate",
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  expectedLifetime: 8640000000000000,
  signatures: [
    "Hv82glByA/MFJGIh8Zl0Pw6a+y+72z0LctP3xS6DdyXnwvqbiDQTI5c23kg8LOm+QAq89kR4aSB+x7ZcH2SY7z+QauUNou8xBQVSXag/QYIDGLsHKyJAupnjh/la2DRoERIExQ6+7t4LcyWyyVkAuPzUGNXdoKhH1Gisro8Frq4Re3IgnleS8707q5MIXiRSLhBymgHKjwAIQO0wmPPQ3AKK8t9ewvYfayCWUxinqDa7ObdlimDG68B73VKNLbhAx7nKS/maGAg+q3mA00qyNNRjQB/7clD8yGAPKo2kIJqPOKOr3QcsjyVobUvBWUUB3pEZM4rS1wROPTCL9YLsaA==",
    "Hv82glByA/MFJGIh8Zl0Pw6a+y+72z0LctP3xS6DdyXnwvqbiDQTI5c23kg8LOm+QAq89kR4aSB+x7ZcH2SY7z+QauUNou8xBQVSXag/QYIDGLsHKyJAupnjh/la2DRoERIExQ6+7t4LcyWyyVkAuPzUGNXdoKhH1Gisro8Frq4Re3IgnleS8707q5MIXiRSLhBymgHKjwAIQO0wmPPQ3AKK8t9ewvYfayCWUxinqDa7ObdlimDG68B73VKNLbhAx7nKS/maGAg+q3mA00qyNNRjQB/7clD8yGAPKo2kIJqPOKOr3QcsjyVobUvBWUUB3pEZM4rS1wROPTCL9YLsaA=="
  ],
  domains: ["url2"],
  subject: "publisher2",
  subjectPublicKey: { data: "5678", format: "public" },
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  },
  version: 2
};

export const publisherCert12: ARPKICert<PublisherCertificate> = {
  type: "PublisherCertificate",
  caMin: 2,
  cas: ["ca.url", "ca2.url"],
  ilses: ["ils.com"],
  expectedLifetime: 8640000000000000,
  signatures: [
    "JGMTkzayMHyopbXesS8imlmn4O5xXWU0MBO9GWMpjapO/i66i1W30vb4sDJzbgTpEMuFimO9UFAJlHC/E4ZmQUaWX4FeDtny52zgMgXz9HVBgY1noypIG8/0aqIQSDnDOqSfNU6KYMxkPHQaYvVk7syxf04D8LDrVnYmqKaQ63xybz+h/WgedFB/fXhT+xRrYuLhpw6EH2kIhe6m7UIG+iiJUvPUn8xln+GMYQNmvOcOeq3wVJTHTVjVJ9+wHbA53xkuPYAELyJM+DDyi+pjaS1p7oj6yjGvWvb1AgxbHL9rHEI2qJFGbmLY6HBQDeygltL+R0OrB2gTUxnE0jaBHQ==",
    "JGMTkzayMHyopbXesS8imlmn4O5xXWU0MBO9GWMpjapO/i66i1W30vb4sDJzbgTpEMuFimO9UFAJlHC/E4ZmQUaWX4FeDtny52zgMgXz9HVBgY1noypIG8/0aqIQSDnDOqSfNU6KYMxkPHQaYvVk7syxf04D8LDrVnYmqKaQ63xybz+h/WgedFB/fXhT+xRrYuLhpw6EH2kIhe6m7UIG+iiJUvPUn8xln+GMYQNmvOcOeq3wVJTHTVjVJ9+wHbA53xkuPYAELyJM+DDyi+pjaS1p7oj6yjGvWvb1AgxbHL9rHEI2qJFGbmLY6HBQDeygltL+R0OrB2gTUxnE0jaBHQ=="
  ],
  domains: ["url2"],
  subject: "publisher",
  subjectPublicKey: { data: "5678", format: "public" },
  validity: {
    notAfter: 8640000000000000,
    notBefore: -8640000000000000
  },
  version: 2
};

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
  deploymentVersion: 0,
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
    '{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"GhIIbnDygFJG9b0s/eNQkvC7vIsbwH6OVzZvvsMEeVA=","leafValue":"CglwdWJsaXNoZXISogt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJpbHNUaW1lb3V0IjowLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiZk1iTXpjNWZGOGpZSS9xZ1VGTjNpSUdNOTdNMzE2MzQ2L1E1czhjYVZLcGZaclQ5TXdRTTg3WVVzaldFQitLL3ltaGZwYUU3M251SnpQNVBVTW5Fa25JZjdtMmxsTmdhWXlMcGs2eithdDFaYkdnYlpjQzRsbnh1T0RUeTVZY3lLTFdoaUNMRWdVS0g4QXduYnRWaDdhMjREK3NYVk1aWHNaNVB6cGFad2Jrc1NYZStHdG9TT3VzY0N5a1NvcGR0OUxzdVBhbUZ2VU9IbmNYaUNWRUJPWnVtVzJoTzdGb0VSM0ZCQXF2Rno5S2h2Z1pYQURBNjg0UXRQVy9UMnJHdXhsQm1ReWtzSmc2YlBQL2NRR01EeEJvZ2tDMzlxVWgwVk9mVzNUZHBJMjNRbGlCMUc1SzZTTHVEa0NKNUo1c3lHVlZUVStNQ3MvdTBWQjgzVFJFK2p3PT0iLCJmTWJNemM1ZkY4allJL3FnVUZOM2lJR005N00zMTYzNDYvUTVzOGNhVktwZlpyVDlNd1FNODdZVXNqV0VCK0sveW1oZnBhRTczbnVKelA1UFVNbkVrbklmN20ybGxOZ2FZeUxwazZ6K2F0MVpiR2diWmNDNGxueHVPRFR5NVljeUtMV2hpQ0xFZ1VLSDhBd25idFZoN2EyNEQrc1hWTVpYc1o1UHpwYVp3YmtzU1hlK0d0b1NPdXNjQ3lrU29wZHQ5THN1UGFtRnZVT0huY1hpQ1ZFQk9adW1XMmhPN0ZvRVIzRkJBcXZGejlLaHZnWlhBREE2ODRRdFBXL1Qyckd1eGxCbVF5a3NKZzZiUFAvY1FHTUR4Qm9na0MzOXFVaDBWT2ZXM1RkcEkyM1FsaUIxRzVLNlNMdURrQ0o1SjVzeUdWVlRVK01Dcy91MFZCODNUUkUranc9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ=="}}',
  mapProofSignature:
    "YpdFR6TxAHaeV/sdlawUhNIgxvQkAjRsJdwlq5wPCfJiRx8dFz5sNPyJ/yGgFpEMO6zMSpmI79iOeIBiecQOTZuwCjZXOBy2AnYOt38NZoZgsUIPbE+RP4lzH5J8cVlCGqMc8jrWhbjZWI01VYZSH8gyM9rgPHMw/vtd39jUw8M7lmfidMpWExWKX8G09KGlCm6lJuo8gaCXPVsL+2GMMBPqF7vWR4pHCfdsR3IK9gzbIczgbGPT+UZbjXfYRlIS/goVM6z2LdXQL0svVygnZYRK4pds5tv20D+CVchb6TpGXJpsKPXam9cQT41UgmblgxlIxb8jqCMaiNRiEANABg==",
  root:
    '{"LogRoot":{"Metadata":"","Revision":"1","RootHash":"7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","Signature":"FCp1DV/JSM+HPj+ZCcYJkDQ7yIPRiIfs7FJpa9G1qsigXBfqDHXGNjM26ewEwirahpBvKKe1ylkBoJjvns5syAHNJaU6nSHgnBnAJbEhCWKSjl0lwQ3KkGXEu8IZrdLnIrOQyQF9Zww4r5wZf9aLQtFqUle8md94+TboYkCXbytXyyWpLDwvly3s3ShRe4IVPBltBmtw65LitkGZjZRGjaskz+lkdM2jX66IwpxeM1/wBKQxhS6MhDmqSuvjcmFr698/f6LwfRD6s0CIVuIlt0BNt4yC+TN+Kavd8ySaoTf8vcCn+PfVxqrEzJ3+uTc4nGHcZgHVX+AJeUTKXKBskA==","TimestampNanos":"1538064541230576400","TreeSize":"1"},"Revision":"1","RootHash":"yg6K/04fQXzrLqM8NrbIUc0chzKILYxTUSb+MrsUWu0=","Signature":"Mok+ETvfdyjSZFYa6VSr8ilJGUOoOJ6SYHQtUO5exlH+f1+DkO6v5pn6R9v3l01J529DTEbejWBa2xzDkdtNDWSl8fiGKGd2cOY4GV8dl8KcLHwvjeyURwRHkHBvzWOzH1cRhonaQFTYJsxsyflxtgMtAoF9/3oAEbiXxvbv/DvEw6Jau7FNg96fiWOkJ3x0fKSCRigySEn1DovE06DrikFgCWE/tFYEBeYzK2S3LcTQ1cl9iiaFQ7gOXPByeC7LQhoxlasTvnzhTfcs84RcU63VAaxl4QAyfI1qmepwGJ/8QJeQGSTETrb9My3b68isV0UFOfebMU1fhxZo2Nldtg==","TimestampNanos":"1538064550101250900"}',
  rootSignature: {
    signature:
      "Uy46D0aoG3ruGrwdwxlP0tYvgGM8BIvhZxhUhxBMfEVRKRGB6tbqirAUr1KKbvUGxSVLskOM2KuddsvLKFURoVg+g6ghjx3NPFzle9va5aU1fCvHyEoQXIppwUOhDntx01V/R4kYK2/dVkE8hXorbaOcW+KhafzR22ZmKCqZFAQJ/aM1FwLA4Qw+KEyRjZ2mqOhuSp0eh4lgIgwqHvlSkN5lvXIMy8MeyAc/n65vJrUrNxlj/qbM2hsal7mWYmxPGei3WktugfN2CK/80JgJ/XHPkVmotmnCM4U36YgBN2zTD+76AG1+Cef8dQSVq0zlg5R9dMawEIAj9EesFzo27A=="
  },
  nonce: 1
};
export const regResponse: RegistrationResponse<PublisherCertificate> = {
  ...regRespAttr,
  type: "RegistrationResponse",
  ...NONCE(regRespAttr, 2)
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

const genResp1Attr = {
  request: generateRequest1,
  type: "GenerateResponse",
  certSignature: sign(generateRequest1.cert, PRIVATE_KEY),
  nonce: 1
};
export const generateResponse1: GenerateResponse<PublisherCertificate> = {
  ...genResp1Attr,
  type: "GenerateResponse",
  ...NONCE(genResp1Attr, 1)
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

const genResp2Attr = {
  request: generateRequest2,
  type: "GenerateResponse",
  certSignature: sign(generateRequest2.cert, PRIVATE_KEY),
  nonce: 1
};
export const generateResponse2: GenerateResponse<ApplicationCertificate> = {
  ...genResp2Attr,
  type: "GenerateResponse",
  ...NONCE(genResp2Attr, 1)
};

export const auditRequest: AuditRequest = {
  cas: ["ca.url", "ca2.url"],
  certType: "PublisherCertificate",
  sinceRevision: "0",
  ils: "ils.com",
  type: "AuditRequest",
  nonce: 1
};

const audResp1Root =
  '{"LogRoot":{"Metadata":"","Revision":"1","RootHash":"7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","Signature":"O5kD2QN8bgXKt8Z+f/SIL4oQDrUru8GFM2ylCv1Y7Yxhs6Cy8xy5Rtc2HiwclM0Blij1il9hHM7IrAakNL667Z6ghtsEUbbE82Mr2JbkV2p4bvJf+5P1sG2gqMcy2wTIPFToXRejy6EhiGsvfqcbXTLqB2d2mdIs8jsiD06B6UDB9kVoy4auqOP3qjBrONb1eLurmuIrIFzN5MvREZr46xBsFZGb7kI/N6eobhYBGaw4wFAz1nHHLmMmQwBNDq0la6B8aFhGn3KnEm2equkQJMePhvC8zZv25mU1MnyJpHWVASBKV5UU1bShPWDIwZduUa7nIncuLknZwzynlLToQA==","TimestampNanos":"1538668144204543700","TreeSize":"1"},"Revision":"1","RootHash":"lJGLA6Bqp+oAt9cl3eOfpPI7kM5rA244j/5IDuQqYnU=","Signature":"nbxnz+8tvzpW6WrS59ng4iEF4qMRj9cWyt3Iw17yjnaWswwWjoxRIdqtbEZDxKUzTpdq7JpX8ehzzHh5U+wdhkWG7uZbAObSb7K91ZJ7xTJjU8nnyLh2tLbPaDOsEVGBVason18QhbrL+FyfT1PLQmyEO6iMuNAUxmJouO/buO3oFMgbHuihaMe9g+5UmErQ1VNLINLphd7AMQKiwqJau8K/QoqqFG2dnq0DWAk/8tHUfu4CMQGNQ3bTiRwQnaATQXVgUqvbYyb7c1MMXiBOQVZWdXJOHeSEpOQVAzord60HVdeoEIHXrUmS5S4t07MsOmA8ydMjMVU/HIhEgumUZA==","TimestampNanos":"1538668152016452000"}';
const auditResp1Attr = {
  consistencyProof: '{"hashesList":[],"leafIndex":"0"}',
  consistencyProofSignature:
    "oyC/zpYVb6sBlXwt5+Z+uSPWuunVnr8JtAAAmKlPWuYYytzyABLt9OeSU15ZVeuV0VXPBkswQjJkge6ib+jA1EiHegIXEK24WfwEpPO34GWPJsO+yNMxdqujVNf30vRzP4wqfEDTjWp+qTmdhMIWgPIzC2Ln8j+YnksPkKhkEMrG9DccT/T+XAL2tnE6bfoCUYX3wXLdMVLCrab0ecr2KEiCuS911WVELxGSUuAzv4XG4vWEtOhLG1zkhjOGfkxiU7/rAw4O6O7vDp0NGwKyFKhpNAyK0Wqg+0glyEjf4nMyv4C81AuPlr8PVpyVdcTOZEJxSyrtsErP8yutCnfvUg==",
  leaves:
    '[{"extraData":"","integrateTimestamp":{"nanos":191343200,"seconds":1538668144},"leafIdentityHash":"7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","leafIndex":"0","leafValue":"CglwdWJsaXNoZXIaogt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJpbHNUaW1lb3V0IjowLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiZk1iTXpjNWZGOGpZSS9xZ1VGTjNpSUdNOTdNMzE2MzQ2L1E1czhjYVZLcGZaclQ5TXdRTTg3WVVzaldFQitLL3ltaGZwYUU3M251SnpQNVBVTW5Fa25JZjdtMmxsTmdhWXlMcGs2eithdDFaYkdnYlpjQzRsbnh1T0RUeTVZY3lLTFdoaUNMRWdVS0g4QXduYnRWaDdhMjREK3NYVk1aWHNaNVB6cGFad2Jrc1NYZStHdG9TT3VzY0N5a1NvcGR0OUxzdVBhbUZ2VU9IbmNYaUNWRUJPWnVtVzJoTzdGb0VSM0ZCQXF2Rno5S2h2Z1pYQURBNjg0UXRQVy9UMnJHdXhsQm1ReWtzSmc2YlBQL2NRR01EeEJvZ2tDMzlxVWgwVk9mVzNUZHBJMjNRbGlCMUc1SzZTTHVEa0NKNUo1c3lHVlZUVStNQ3MvdTBWQjgzVFJFK2p3PT0iLCJmTWJNemM1ZkY4allJL3FnVUZOM2lJR005N00zMTYzNDYvUTVzOGNhVktwZlpyVDlNd1FNODdZVXNqV0VCK0sveW1oZnBhRTczbnVKelA1UFVNbkVrbklmN20ybGxOZ2FZeUxwazZ6K2F0MVpiR2diWmNDNGxueHVPRFR5NVljeUtMV2hpQ0xFZ1VLSDhBd25idFZoN2EyNEQrc1hWTVpYc1o1UHpwYVp3YmtzU1hlK0d0b1NPdXNjQ3lrU29wZHQ5THN1UGFtRnZVT0huY1hpQ1ZFQk9adW1XMmhPN0ZvRVIzRkJBcXZGejlLaHZnWlhBREE2ODRRdFBXL1Qyckd1eGxCbVF5a3NKZzZiUFAvY1FHTUR4Qm9na0MzOXFVaDBWT2ZXM1RkcEkyM1FsaUIxRzVLNlNMdURrQ0o1SjVzeUdWVlRVK01Dcy91MFZCODNUUkUranc9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ==","merkleLeafHash":"7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","queueTimestamp":{"nanos":452300200,"seconds":1538668134}}]',
  leavesSignature:
    "UIyDdanO/GHikStZv+Nr3wDU+aVccxJ1fdOfDOvrg8rBOf4Br8HbjPP/wdP7XneW/JiGCwK36nSgdOfCvfIFKtV4Av3wwPHRgHxnsP1s8TpAi4nlBpgTnLEZgUh5HBfC6lCT11LLW/ZEW07TSOQuYh0H16EDWIYwSE5vrSilrNDN3mIHw5pa8zRa2gQsbRq3Vs3Bn0ydoxJNoHbrfYnaQyMGJLhZDHJ9i8woPZY6bSQsx1wqV7jHKEqBhItn9vhCrJrDS/9AL2/Xx6PpyCwPglzp+0K6kRj1VKWoyN0fip+4NyUTnPsLSLHYri2dqiX+LGg2adkoOCbAaybtuelY/w==",
  logProofs: '[[{"hashesList":[],"leafIndex":"0"}]]',
  logProofsSignature:
    "PfjMGg2dfU8RhrMDc1wIX6IjRqPR3lDIoLxBQTxtQ1NQ2wMEmBpZJBAMOHrIMExZiwiPI+tKwQUk5NxGK9DwT11eqWjnZEWftaFUyuPwTbvamMQZTFXrkRKqBviPOivNlSfGQq8zZgYK1k8LhNh9tbtgddzqIrkTl1bRMhrREzVXicaX6hWTCPZ0TsPmS0TLuKEDHsaMmN7vpqBekFdF7u8rsMgyT03TWAcT68DT8TdIC2aWh4zva39Rom0PdSe402TUUP1VyisQ8b6Q5wCOofpDD7w+HcsSmwqRkZ+LDzzaZh0wco0Pk5/aKLZEkAL1a513FVomvTH8yBl6hNJqJw==",
  mapProofs:
    '[{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"bKF0Clh/kpOH+Aq6ydxM5WdRbs5w9Zj5IVeVHJFfaFM=","leafValue":"CglwdWJsaXNoZXISogt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJpbHNUaW1lb3V0IjowLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiZk1iTXpjNWZGOGpZSS9xZ1VGTjNpSUdNOTdNMzE2MzQ2L1E1czhjYVZLcGZaclQ5TXdRTTg3WVVzaldFQitLL3ltaGZwYUU3M251SnpQNVBVTW5Fa25JZjdtMmxsTmdhWXlMcGs2eithdDFaYkdnYlpjQzRsbnh1T0RUeTVZY3lLTFdoaUNMRWdVS0g4QXduYnRWaDdhMjREK3NYVk1aWHNaNVB6cGFad2Jrc1NYZStHdG9TT3VzY0N5a1NvcGR0OUxzdVBhbUZ2VU9IbmNYaUNWRUJPWnVtVzJoTzdGb0VSM0ZCQXF2Rno5S2h2Z1pYQURBNjg0UXRQVy9UMnJHdXhsQm1ReWtzSmc2YlBQL2NRR01EeEJvZ2tDMzlxVWgwVk9mVzNUZHBJMjNRbGlCMUc1SzZTTHVEa0NKNUo1c3lHVlZUVStNQ3MvdTBWQjgzVFJFK2p3PT0iLCJmTWJNemM1ZkY4allJL3FnVUZOM2lJR005N00zMTYzNDYvUTVzOGNhVktwZlpyVDlNd1FNODdZVXNqV0VCK0sveW1oZnBhRTczbnVKelA1UFVNbkVrbklmN20ybGxOZ2FZeUxwazZ6K2F0MVpiR2diWmNDNGxueHVPRFR5NVljeUtMV2hpQ0xFZ1VLSDhBd25idFZoN2EyNEQrc1hWTVpYc1o1UHpwYVp3YmtzU1hlK0d0b1NPdXNjQ3lrU29wZHQ5THN1UGFtRnZVT0huY1hpQ1ZFQk9adW1XMmhPN0ZvRVIzRkJBcXZGejlLaHZnWlhBREE2ODRRdFBXL1Qyckd1eGxCbVF5a3NKZzZiUFAvY1FHTUR4Qm9na0MzOXFVaDBWT2ZXM1RkcEkyM1FsaUIxRzVLNlNMdURrQ0o1SjVzeUdWVlRVK01Dcy91MFZCODNUUkUranc9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ=="}}]',
  mapProofsSignature:
    "O7QI20KoIlirmlZYgOD8IyMWTpvu0xSOOQhwuwNvAOXG3wgoKdVakhcBnTC8NZXND+w1BiXYQIzF19N9sLEKqdk0lyGS+bsblptWj3GxQPp222JAubMzMI3ofb5ZfBVYOb2YruvHjdAq/hMMSDGEqzxxz/pBHmBrEoU4Sp3tKBkiegOl64gI/or3S0AorwcybQr4wnT4v4M1uTnZApuGH+lMCEY29zz8gON+RK1JK8IhQEB8Enf/IpgMVttr7MvhOUXylm2bIVaG63OC+/oXdD9QBWi8CgcQ0aS+uJUz/u8fZin6l74HfKwWyBnOUGnwBkm2XDZloqtAdxHaXmI8yQ==",
  nonce: 1,
  root: audResp1Root,
  rootSignature: createTestAcc(JSON.parse(audResp1Root), 3),
  request: auditRequest,
  type: "AuditResponse"
};
export const auditResponse: AuditResponse = {
  ...auditResp1Attr,
  type: "AuditResponse",
  ...NONCE(auditResp1Attr, 3)
};

export const auditRequest2: AuditRequest = {
  cas: ["ca.url", "ca2.url"],
  certType: "PublisherCertificate",
  sinceRevision: "1",
  ils: "ils.com",
  type: "AuditRequest",
  nonce: 1
};

const audResp2Root =
  '{"LogRoot":{"Metadata":"","Revision":"3","RootHash":"3N0OksAuwAXYxSt23DAysxNkBW1A2UgcMsnsDyn1CBs=","Signature":"lBJe+QXUVY58aebPHBSLlkv5YfWJVjbB4SxmePDRS5QCf11MG5owjkNQMfHprRLAfY9eZEC+1xlmOMYX8sBg4ib/deDHF1H5wGPL7RutTAee5DGUWVzT2AmcO3IGUP1HDuePs7xMlOcSBbdE6lcksAw1eTvSH77ffsotxa4i0ZvnAmQXMm29kJKd9l+geC8eTIrygAtFjDz8gG9qhjnqYfsynGUujwSckyWv3oBQzORhx75dne3VYqxvsxodAwczaYQ2ohTKbuymNx9NAtuYXMv7CLmglJrpKJe7GKYCAco/JUlPzjXs37gAli+azVQSwVvYSU1RD1FgCbuWASPIUg==","TimestampNanos":"1538668164195275400","TreeSize":"3"},"Revision":"3","RootHash":"bIAv0c/CcEov7A7TIj9iveMcBfyb7tHG7BaYljDr+BE=","Signature":"mfzLQqN3War3P/e+WVowv6T0qGqVp+08hB8YSlXZ/VlKga2jrKMJAeda84UhHYXhqA/9I88c2NbznjhtLi50sL7ESCqHYZ2L5Pfwq0lVeG1OA4bAecUjsH9ax+Xu3/xUgsij4nSNpmIS9i7+KGxLy7VxQbOi+GNlKX3+lwRsGqzi8cqFSgasXNrLLPX+YNEjDgcMdf3AMaka7rr/g1nESHwJ5caH/yn7I/Z2aXZjivIccW2bnB0bi3PaRBc+ae7d8KxFGWIeu3Q/3MaE86TLoYAwAFOBlMuoa2JP08xguukqUS0NTV/OLDEc7eeq32NT6dguz9ZGRCf3vlNQXbnVuA==","TimestampNanos":"1538668165209877600"}';
const audResp2Attr = {
  consistencyProof:
    '{"hashesList":["zEqmlCQ77VXOXKf65p3tKUsjJ94rbH0ePa0Kfa7qk+Q=","nz2QbpyrWn1+8YQD6LHeBgbdkxTxGPUtylgW26xU5aQ="],"leafIndex":"0"}',
  consistencyProofSignature:
    "TX0AcyFhClSvLtcriYPaCnbi6gfdsmk3TxIiD4p25/SPfC3z7SPYDBC62J3dAAuP0+ykEG16VZXX76APrzklF2e5VQL5ZlOjIYCEkgdtFaWKBRXnHEf04rKykY5BMTyVwMmVf9QswApjsRs8RsZRDZEsnF5c7RN6v6OVTJqAwJbCnZLOuBMOr6EW1kuGZYMwGAn5lQaLHryCKV/LQ2i9XgUes958TPNB8JVBvznG1JlAw1jp2oVttwNeTcGvllfSGJcJOAhMYDJNvJeDApy8IpP79CXfdps2FBFVqLQIdkhyzP/ePOH7OkgjREIACFYLrDTAzcppSq8ryPOIXG9zcA==",
  leaves:
    '[{"extraData":"","integrateTimestamp":{"nanos":184646800,"seconds":1538668154},"leafIdentityHash":"zEqmlCQ77VXOXKf65p3tKUsjJ94rbH0ePa0Kfa7qk+Q=","leafIndex":"1","leafValue":"CglwdWJsaXNoZXIQARrdB3siY2FNaW4iOjIsImNhcyI6WyJjYS51cmwiLCJjYTIudXJsIl0sImRvbWFpbnMiOlsidXJsMiJdLCJpbHNUaW1lb3V0IjowLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiSkdNVGt6YXlNSHlvcGJYZXNTOGltbG1uNE81eFhXVTBNQk85R1dNcGphcE8vaTY2aTFXMzB2YjRzREp6YmdUcEVNdUZpbU85VUZBSmxIQy9FNFptUVVhV1g0RmVEdG55NTJ6Z01nWHo5SFZCZ1kxbm95cElHOC8wYXFJUVNEbkRPcVNmTlU2S1lNeGtQSFFhWXZWazdzeXhmMDREOExEclZuWW1xS2FRNjN4eWJ6K2gvV2dlZEZCL2ZYaFQreFJyWXVMaHB3NkVIMmtJaGU2bTdVSUcraWlKVXZQVW44eGxuK0dNWVFObXZPY09lcTN3VkpUSFRWalZKOSt3SGJBNTN4a3VQWUFFTHlKTStERHlpK3BqYVMxcDdvajZ5akd2V3ZiMUFneGJITDlySEVJMnFKRkdibUxZNkhCUURleWdsdEwrUjBPckIyZ1RVeG5FMGphQkhRPT0iLCJKR01Ua3pheU1IeW9wYlhlc1M4aW1sbW40TzV4WFdVME1CTzlHV01wamFwTy9pNjZpMVczMHZiNHNESnpiZ1RwRU11RmltTzlVRkFKbEhDL0U0Wm1RVWFXWDRGZUR0bnk1MnpnTWdYejlIVkJnWTFub3lwSUc4LzBhcUlRU0RuRE9xU2ZOVTZLWU14a1BIUWFZdlZrN3N5eGYwNEQ4TERyVm5ZbXFLYVE2M3h5YnoraC9XZ2VkRkIvZlhoVCt4UnJZdUxocHc2RUgya0loZTZtN1VJRytpaUpVdlBVbjh4bG4rR01ZUU5tdk9jT2VxM3dWSlRIVFZqVko5K3dIYkE1M3hrdVBZQUVMeUpNK0REeWkrcGphUzFwN29qNnlqR3ZXdmIxQWd4YkhMOXJIRUkycUpGR2JtTFk2SEJRRGV5Z2x0TCtSME9yQjJnVFV4bkUwamFCSFE9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiNTY3OCIsImZvcm1hdCI6InB1YmxpYyJ9LCJ0eXBlIjoiUHVibGlzaGVyQ2VydGlmaWNhdGUiLCJ2YWxpZGl0eSI6eyJub3RBZnRlciI6ODY0MDAwMDAwMDAwMDAwMCwibm90QmVmb3JlIjotODY0MDAwMDAwMDAwMDAwMH0sInZlcnNpb24iOjJ9","merkleLeafHash":"zEqmlCQ77VXOXKf65p3tKUsjJ94rbH0ePa0Kfa7qk+Q=","queueTimestamp":{"nanos":297829400,"seconds":1538668152}},{"extraData":"","integrateTimestamp":{"nanos":186621700,"seconds":1538668164},"leafIdentityHash":"nz2QbpyrWn1+8YQD6LHeBgbdkxTxGPUtylgW26xU5aQ=","leafIndex":"2","leafValue":"CgpwdWJsaXNoZXIyGt4HeyJjYU1pbiI6MiwiY2FzIjpbImNhLnVybCIsImNhMi51cmwiXSwiZG9tYWlucyI6WyJ1cmwyIl0sImlsc1RpbWVvdXQiOjAsImlsc2VzIjpbImlscy5jb20iXSwic2lnbmF0dXJlcyI6WyJIdjgyZ2xCeUEvTUZKR0loOFpsMFB3NmEreSs3MnowTGN0UDN4UzZEZHlYbnd2cWJpRFFUSTVjMjNrZzhMT20rUUFxODlrUjRhU0IreDdaY0gyU1k3eitRYXVVTm91OHhCUVZTWGFnL1FZSURHTHNIS3lKQXVwbmpoL2xhMkRSb0VSSUV4UTYrN3Q0TGN5V3l5VmtBdVB6VUdOWGRvS2hIMUdpc3JvOEZycTRSZTNJZ25sZVM4NzA3cTVNSVhpUlNMaEJ5bWdIS2p3QUlRTzB3bVBQUTNBS0s4dDlld3ZZZmF5Q1dVeGlucURhN09iZGxpbURHNjhCNzNWS05MYmhBeDduS1MvbWFHQWcrcTNtQTAwcXlOTlJqUUIvN2NsRDh5R0FQS28ya0lKcVBPS09yM1Fjc2p5Vm9iVXZCV1VVQjNwRVpNNHJTMXdST1BUQ0w5WUxzYUE9PSIsIkh2ODJnbEJ5QS9NRkpHSWg4WmwwUHc2YSt5KzcyejBMY3RQM3hTNkRkeVhud3ZxYmlEUVRJNWMyM2tnOExPbStRQXE4OWtSNGFTQit4N1pjSDJTWTd6K1FhdVVOb3U4eEJRVlNYYWcvUVlJREdMc0hLeUpBdXBuamgvbGEyRFJvRVJJRXhRNis3dDRMY3lXeXlWa0F1UHpVR05YZG9LaEgxR2lzcm84RnJxNFJlM0lnbmxlUzg3MDdxNU1JWGlSU0xoQnltZ0hLandBSVFPMHdtUFBRM0FLSzh0OWV3dllmYXlDV1V4aW5xRGE3T2JkbGltREc2OEI3M1ZLTkxiaEF4N25LUy9tYUdBZytxM21BMDBxeU5OUmpRQi83Y2xEOHlHQVBLbzJrSUpxUE9LT3IzUWNzanlWb2JVdkJXVVVCM3BFWk00clMxd1JPUFRDTDlZTHNhQT09Il0sInN1YmplY3QiOiJwdWJsaXNoZXIyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiNTY3OCIsImZvcm1hdCI6InB1YmxpYyJ9LCJ0eXBlIjoiUHVibGlzaGVyQ2VydGlmaWNhdGUiLCJ2YWxpZGl0eSI6eyJub3RBZnRlciI6ODY0MDAwMDAwMDAwMDAwMCwibm90QmVmb3JlIjotODY0MDAwMDAwMDAwMDAwMH0sInZlcnNpb24iOjJ9","merkleLeafHash":"nz2QbpyrWn1+8YQD6LHeBgbdkxTxGPUtylgW26xU5aQ=","queueTimestamp":{"nanos":852703500,"seconds":1538668154}}]',
  leavesSignature:
    "QDiPcNPS8uFT3lvoVPopjres5Ehvo64yzzFWoxVPjvHC6zJeyYsHgTQftHT23vIhzHYY5VGsVB1Dn8wyOy6v6C5SrsO5Zb1+kT8IA2O+bM9yyuGiaU9R9gqLtk1GSnqLWMaXvoVDUnXKygMVH7S7Hv0XdDtdkOxnN+iA7XKaC+hvCuWFB2gXmgUXld66cvm75rW4xT5CaF87ieZFSvyhAD+34wrMIifiNqWhnGtrAePsIvRRQwrdDCTpvs6Y/t6GLjgIuxrKRGANG4lfBT9FVcnjfD5jIFHhFSXwnPGxeFv+hPC9/om8SqyfLnrY3PlfWJ025g+Fozw7470XnaRd2g==",
  logProofs:
    '[[{"hashesList":["7xfzUvIgKfA7ohwFHyUZkpFARYKdzajGBZt0IhgHC40=","nz2QbpyrWn1+8YQD6LHeBgbdkxTxGPUtylgW26xU5aQ="],"leafIndex":"1"}],[{"hashesList":["S1KSXlrfT3x53XHd7fAkx33xDD3jHzHbx3lXpMfFjYY="],"leafIndex":"2"}]]',
  logProofsSignature:
    "aFGo1G24BtA2xwia2zTnAqT8MINxbTFpNk1w6Hx7hyu4NcSqsf3KrLjjkYeLcN7f2NN/R/QgxqEpzzbHpk4cxxNJnXVQG6lRJ02FVzE0bSLDSvYmuMMCiCwMc9nJsnTz9xdibJAtyF931kXR/0SCegncoagIoyg5EsLr2iu/0SqpfS8JX8xzK9YqIhb4VW0W3zLc4jT4DQt44Yj0Rq6Cau6UuJQ7eJUD6CRcHPi1zXFbusXbQe3V7/+mVW4SoPQ2rtCnb33MYRDLq9nhgQPFnjIGus/teaWIhfaJJ6RGSjp7v5C8vQO9BtzuRjfahqq4Z35QL9z9OXIOE6Fy/clGtQ==",
  mapProofs:
    '[{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","Oetd4Q3q2wH5PxnfF9R0bRRbzgZNdyqbKvW3e9bRAhg=",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"9Kwx7ZcbPkF7gMAq6fJfTiyo0q/MA17UGTP1p0imXtw=","leafValue":"CglwdWJsaXNoZXIS3Qd7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybDIiXSwiaWxzVGltZW91dCI6MCwiaWxzZXMiOlsiaWxzLmNvbSJdLCJzaWduYXR1cmVzIjpbIkpHTVRremF5TUh5b3BiWGVzUzhpbWxtbjRPNXhYV1UwTUJPOUdXTXBqYXBPL2k2NmkxVzMwdmI0c0RKemJnVHBFTXVGaW1POVVGQUpsSEMvRTRabVFVYVdYNEZlRHRueTUyemdNZ1h6OUhWQmdZMW5veXBJRzgvMGFxSVFTRG5ET3FTZk5VNktZTXhrUEhRYVl2Vms3c3l4ZjA0RDhMRHJWblltcUthUTYzeHlieitoL1dnZWRGQi9mWGhUK3hScll1TGhwdzZFSDJrSWhlNm03VUlHK2lpSlV2UFVuOHhsbitHTVlRTm12T2NPZXEzd1ZKVEhUVmpWSjkrd0hiQTUzeGt1UFlBRUx5Sk0rRER5aStwamFTMXA3b2o2eWpHdld2YjFBZ3hiSEw5ckhFSTJxSkZHYm1MWTZIQlFEZXlnbHRMK1IwT3JCMmdUVXhuRTBqYUJIUT09IiwiSkdNVGt6YXlNSHlvcGJYZXNTOGltbG1uNE81eFhXVTBNQk85R1dNcGphcE8vaTY2aTFXMzB2YjRzREp6YmdUcEVNdUZpbU85VUZBSmxIQy9FNFptUVVhV1g0RmVEdG55NTJ6Z01nWHo5SFZCZ1kxbm95cElHOC8wYXFJUVNEbkRPcVNmTlU2S1lNeGtQSFFhWXZWazdzeXhmMDREOExEclZuWW1xS2FRNjN4eWJ6K2gvV2dlZEZCL2ZYaFQreFJyWXVMaHB3NkVIMmtJaGU2bTdVSUcraWlKVXZQVW44eGxuK0dNWVFObXZPY09lcTN3VkpUSFRWalZKOSt3SGJBNTN4a3VQWUFFTHlKTStERHlpK3BqYVMxcDdvajZ5akd2V3ZiMUFneGJITDlySEVJMnFKRkdibUxZNkhCUURleWdsdEwrUjBPckIyZ1RVeG5FMGphQkhRPT0iXSwic3ViamVjdCI6InB1Ymxpc2hlciIsInN1YmplY3RQdWJsaWNLZXkiOnsiZGF0YSI6IjU2NzgiLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoyfQ=="}},{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","OGlMUydvyPS9/nyqkD2t+Kul+0kV4uK627F5an55OVU=",""],"leaf":{"extraData":"","index":"FbIljMpTpDa0v2F2apta436YhAcG/TmAPPhhQUy14aM=","leafHash":"dPllhGV2CtcTgx/DJQfTt7qrrPZ2qu7vhpdi7FXpVfc=","leafValue":"CgpwdWJsaXNoZXIyEt4HeyJjYU1pbiI6MiwiY2FzIjpbImNhLnVybCIsImNhMi51cmwiXSwiZG9tYWlucyI6WyJ1cmwyIl0sImlsc1RpbWVvdXQiOjAsImlsc2VzIjpbImlscy5jb20iXSwic2lnbmF0dXJlcyI6WyJIdjgyZ2xCeUEvTUZKR0loOFpsMFB3NmEreSs3MnowTGN0UDN4UzZEZHlYbnd2cWJpRFFUSTVjMjNrZzhMT20rUUFxODlrUjRhU0IreDdaY0gyU1k3eitRYXVVTm91OHhCUVZTWGFnL1FZSURHTHNIS3lKQXVwbmpoL2xhMkRSb0VSSUV4UTYrN3Q0TGN5V3l5VmtBdVB6VUdOWGRvS2hIMUdpc3JvOEZycTRSZTNJZ25sZVM4NzA3cTVNSVhpUlNMaEJ5bWdIS2p3QUlRTzB3bVBQUTNBS0s4dDlld3ZZZmF5Q1dVeGlucURhN09iZGxpbURHNjhCNzNWS05MYmhBeDduS1MvbWFHQWcrcTNtQTAwcXlOTlJqUUIvN2NsRDh5R0FQS28ya0lKcVBPS09yM1Fjc2p5Vm9iVXZCV1VVQjNwRVpNNHJTMXdST1BUQ0w5WUxzYUE9PSIsIkh2ODJnbEJ5QS9NRkpHSWg4WmwwUHc2YSt5KzcyejBMY3RQM3hTNkRkeVhud3ZxYmlEUVRJNWMyM2tnOExPbStRQXE4OWtSNGFTQit4N1pjSDJTWTd6K1FhdVVOb3U4eEJRVlNYYWcvUVlJREdMc0hLeUpBdXBuamgvbGEyRFJvRVJJRXhRNis3dDRMY3lXeXlWa0F1UHpVR05YZG9LaEgxR2lzcm84RnJxNFJlM0lnbmxlUzg3MDdxNU1JWGlSU0xoQnltZ0hLandBSVFPMHdtUFBRM0FLSzh0OWV3dllmYXlDV1V4aW5xRGE3T2JkbGltREc2OEI3M1ZLTkxiaEF4N25LUy9tYUdBZytxM21BMDBxeU5OUmpRQi83Y2xEOHlHQVBLbzJrSUpxUE9LT3IzUWNzanlWb2JVdkJXVVVCM3BFWk00clMxd1JPUFRDTDlZTHNhQT09Il0sInN1YmplY3QiOiJwdWJsaXNoZXIyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiNTY3OCIsImZvcm1hdCI6InB1YmxpYyJ9LCJ0eXBlIjoiUHVibGlzaGVyQ2VydGlmaWNhdGUiLCJ2YWxpZGl0eSI6eyJub3RBZnRlciI6ODY0MDAwMDAwMDAwMDAwMCwibm90QmVmb3JlIjotODY0MDAwMDAwMDAwMDAwMH0sInZlcnNpb24iOjJ9"}}]',
  mapProofsSignature:
    "SmG65iZuRx77/JfsVqyLlR05RaidBdM+OgOfCy/QzwT3Y2jLbGuhF6A791fGfiDC2WaQwunJx429oatOHDl8yIW1YmyMb2S3utGQ83zrGTdtVF29EQdvmQPpIOIG6f8tQkrVwUPS3vDiecodfZpdaYYqnAhJVSGWP6cKvpYQ58+mZ/6RTrA5NlVlNxpOP2dmms2hV0kapvZ/pEHBCh+34ms41qpy/CdzaAZ+8OFHbekkwYWsX/h37GkN82vaPlJ+BhMy1KsJHc1+QibDPhSmw62L1mwXQAWqYpXYXRdsa80hKAE56G1vw0H0sVQ80+a2zORF+zQaDfhcVxM7jdZ9Qg==",
  nonce: 1,
  root: audResp2Root,
  rootSignature: createTestAcc(JSON.parse(audResp2Root), 3),
  request: auditRequest2,
  type: "AuditResponse"
};

export const auditResponse2: AuditResponse = {
  ...audResp2Attr,
  type: "AuditResponse",
  ...NONCE(audResp2Attr, 3)
};
