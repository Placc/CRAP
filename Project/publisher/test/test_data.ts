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
import { DeployRequest } from "../src/requests/Deploy";
import { PublisherConfiguration } from "../src/config/types";
import { DeleteRequest } from "../src/requests/Delete";
import {
  RegistrationResponse,
  RegistrationRequest
} from "common/communication/requests/Registration";
import {
  GenerateRequest,
  GenerateResponse
} from "common/communication/requests/Generate";

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
    case "GenerateRequest":
      const rawres = {
        nonce: req.nonce,
        ...req["cert"],
        certSignature: sign(req["cert"], PRIVATE_KEY)
      };
      const res = { ...rawres, ...NONCE(rawres, 1) };
      return Promise.resolve(res);
    case "RegistrationRequest":
    case "UpdateRequest":
    case "DeleteRequest":
      const rawres2 = {
        nonce: req.nonce,
        acceptanceConfirmation: {
          signature: sign(req["cert"], PRIVATE_KEY)
        }
      };
      const res2 = {
        ...rawres2,
        ...NONCE(rawres2, req["cert"]["cas"].length + 1),
        acceptanceConfirmation: createTestAcc(
          req["cert"],
          req["cert"]["cas"].length + 1
        )
      };
      return Promise.resolve(res2);
  }
  return Promise.resolve(); //Promise.reject("test-data send");
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
      TreeId: "4740600500096865537",
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

export const configuration: PublisherConfiguration = {
  defaultCertLifetime: 3600,
  domains: publisherCert1.domains,
  minimumCAs: 2,
  expectedLifetime: 8640000000000000,
  subjectName: publisherCert1.subject,
  trustedCAs: publisherCert1.cas,
  trustedILSes: publisherCert1.ilses
};

export const deployRequest: DeployRequest = {
  applicationUrl: applicationCert1.applicationUrl,
  configuration,
  deploymentVersion: 12345,
  resources: applicationCert1.resources
};

export const deleteRequest: DeleteRequest = {
  applicationUrl: deployRequest.applicationUrl,
  configuration
};
