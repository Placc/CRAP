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
    case "GetRequest":
      const { nonce, nonceSignature, ...res } =
        req["domain"] == publisherCert1.subject ? getResponse : getResponse1;
      const rawRootSig = res.rootSignature.data
        ? res.rootSignature.data.data!
        : res.rootSignature;
      const rawRes = { nonce: req.nonce, ...res, rootSignature: rawRootSig };
      const nn = NONCE(rawRes, 3);
      return Promise.resolve({
        ...nn,
        ...rawRes,
        rootSignature: createTestAcc(rawRootSig, 3, true)
      });
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
      TreeId: "3008287208970861871",
      TreeType: 2
    },
    {
      ContentType: 1,
      PublicKey: new Uint8Array(0),
      TreeId: "6259415026393735312",
      TreeType: 2
    },
    {
      ContentType: 2,
      PublicKey: new Uint8Array(0),
      TreeId: "5782228196942048576",
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

export let publisherCert1: ARPKICert<PublisherCertificate> = {
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
    '{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"TwOgYLfrAyly3LMn8smJsU1ec8NbPVkopvh1yjnBWbo=","leafHash":"uPXXZcyncU0rf0rrpgt5apenpstpk0jnGwiymmnLcgw=","leafValue":"CglwdWJsaXNoZXIStwt7ImNhTWluIjoyLCJjYXMiOlsiY2EudXJsIiwiY2EyLnVybCJdLCJkb21haW5zIjpbInVybCJdLCJleHBlY3RlZExpZmV0aW1lIjo4NjQwMDAwMDAwMDAwMDAwLCJpbHNlcyI6WyJpbHMuY29tIl0sInNpZ25hdHVyZXMiOlsiazlDUkRKU2REaHQzMzRndjBGOTVZUi85YkJyZC94T0dkVzAzcjI5ZW41THdBM1ZENi9PdGdQN2ZuZ05WR3pIcSt3ZmpZNzFqTmR1Nmt1VEF2bWUxQVVaNlVYaWlUZHNNV2hLdXQzdnd5SWdtMHFNZU5zUE0ycG5wd05WSzhXeEVlN0NxRnNvR1BYSXhIUE0wZ25SWnA4QjZFZ1JUQWcvQ3RTL2IrV2pKdWNKNmVrakg4eDQrVXV5TVVvQkdNNzVNNEhsOGxoVkYxSHM4M1NSdHpzV3dYM3c4cE91bFQweWZDY0JRN3Z2MVJEZk1sYitvYWp4Z2FuQitxaCtvNWFiVysrQ1ZTR3BNWDI1R242T3JpWkVSY2FCRzROd2FRZGt1UjhvTlZLNkNXczJ4UER2aS9HTXp5ZnpWajYwdWZNMnVkSE5Eb1hxWURZOWhjOExKc3pwaHpRPT0iLCJrOUNSREpTZERodDMzNGd2MEY5NVlSLzliQnJkL3hPR2RXMDNyMjllbjVMd0EzVkQ2L090Z1A3Zm5nTlZHekhxK3dmalk3MWpOZHU2a3VUQXZtZTFBVVo2VVhpaVRkc01XaEt1dDN2d3lJZ20wcU1lTnNQTTJwbnB3TlZLOFd4RWU3Q3FGc29HUFhJeEhQTTBnblJacDhCNkVnUlRBZy9DdFMvYitXakp1Y0o2ZWtqSDh4NCtVdXlNVW9CR003NU00SGw4bGhWRjFIczgzU1J0enNXd1gzdzhwT3VsVDB5ZkNjQlE3dnYxUkRmTWxiK29hanhnYW5CK3FoK281YWJXKytDVlNHcE1YMjVHbjZPcmlaRVJjYUJHNE53YVFka3VSOG9OVks2Q1dzMnhQRHZpL0dNenlmelZqNjB1Zk0ydWRITkRvWHFZRFk5aGM4TEpzenBoelE9PSJdLCJzdWJqZWN0IjoicHVibGlzaGVyIiwic3ViamVjdFB1YmxpY0tleSI6eyJkYXRhIjoiLS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS1cbk1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBcGNHNS9XZjdDYjhUL1ZNYWt0bjdcbm9Wa0p3Yi93NTZGQWJRZkxGLzJqMy9TbjQweGZLNlIvem9nUFJxQ3NvQmhYbEVVUitjakxzMURQbGEwWUdJVEVcbkRqajVRSG12bVBhY005RWFld1gxRUQzcXBacHFwcXZ4MFFTaDJUVXFVYlBVNTlqODN0Zy9hQmJ1QUlpcWN1SHpcbmZQWnA0c3g5OE5oRVQwQzlZZjFrOVBiNWpFWmozSGpjeFlmdmIxN3djeXZRNU5rVm9pLzgyUDJrVm9JZjRBbHNcbldrYkIyWFFZNnp0SW0vY1V2MXRMcjZNYUNBTHhpcmQ0dmFZUEhKN21wMFRlN1BCRnBEUW41ZzNPNjUwdXppaUNcbnJMRENIZnZYZVpMZ3dzbzZoS2p6bE13YUJwRGxkcnBIVEpJYW9UWGRIMVhSUVVuVU4rMmFHWjc4dElKOWhoN2xcbkl3SURBUUFCXG4tLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0iLCJmb3JtYXQiOiJwdWJsaWMifSwidHlwZSI6IlB1Ymxpc2hlckNlcnRpZmljYXRlIiwidmFsaWRpdHkiOnsibm90QWZ0ZXIiOjg2NDAwMDAwMDAwMDAwMDAsIm5vdEJlZm9yZSI6LTg2NDAwMDAwMDAwMDAwMDB9LCJ2ZXJzaW9uIjoxfQ=="}}',
  mapProofSignature:
    "YtKFqiHtpDeKwcGqhkz29/WC3a4JoNtbaFxtjAZIdypyZVaWdcVzU/4wBRxDpCpjOHJf+Y85t4ZYIyEz/rVWEbpEk8hqZgKcMJMkvKQW/RWZDtrdQmLC1sdfEv/CgtHwlC1V9KmXEP4ESaddW2gmFgsL94awwEFBykilXZ3srzEqIcfBXYDP8xthiMWSyUiiB88IZQ+L50zl5SHZJj9E3Z/hEO+ecQE5tJjWH523RSeUu3pUmWrId0J0r7bMOASXIbML5J24D8ln+4y4yLw2jp/IMxqp2XVEhEL8sLAOqRyKlMv/lBp8vccbe9zzsuYM54t4KDMNyFHgodMYzBOeww==",
  root:
    '{"LogRoot":{"Metadata":"","Revision":"1","RootHash":"QhjUyHXhr4/Po/PiLGulvVZh3MZYI087EnN7L3CDZ9E=","Signature":"Kk5GG50b953nEOQK5Uwz5AiBkMsFqx5pt71bZvAlAb9iQpeDEV4UxXHrC2RxR+1LAp+F24xr5s946HOWhIOJDGy4q4jJhEjnV/uHJcNE5lbxg//fHcGOu2E5/IF5+QSkkeFIUXn5DXePZuF4Moqh+6kNl+hxoVXkGeYqri7SOch2IZv00zY4cbFZntaPA/i/avGcuYHH9DUeAEXrnHlsM88cNlDvjQvOlGlVKu1wQQopBMEGx198xjJiu5kfdjH5uMnMx0sDXPCczwj70t6nnnUCjUtXwHAa9qmUwJiN2beRCiMh4RX+N3P490ZkTXfoUFoO6HkQkvhYGhrHYrgS+w==","TimestampNanos":"1546979708807164900","TreeSize":"1"},"Revision":"1","RootHash":"EShbf1HIS7H9g5u+dWex9dUGDOX+m6xHT3Wvn9iM7es=","Signature":"CUE7MiEBO6VV8knQPbYDjGiivpNW5M2DsEPN5zyJcq4u+iDm8MiYus7Nzc6KOw/g3OZycsjXaZcVGBftoS7Z95cmo9uDRO8MCWej+t9kwsnumklmb6V6kUK6bqYWBy/bnw/2cXn24YRmRmKq0A09WrYgr7LVoduEsMp7kkkHVQgiW9Ofcta+iSSwkQQtSKPL3J8MbCBBoRlAd/1Eo6UIcJpjOImJ4oynuYUg7iDYSXKIJYWr73JlJ3P6hR7MILsvqcSan928SSIGog2EvV7Jt5q+9j/PxrWn/5k5fw3S3vjvQMrsZlMpXeZYzpdnArxj4cQeyWVSj2Oi06onWpWQVg==","TimestampNanos":"1546979720764720500"}',
  rootSignature: {
    signature:
      "huu5UTqHMLpbJr5soVQXSNYy8FOPjc7qgNc9EwiaORIT/mIwTKGenNQxDu0FR5sRIa2Zv3InsASSCWzNmRKS4TMeh6gOevheiVoMeaIlsKXDqX892QgSrmtrJnHCPlWUvg7iaN0+4H7dnr5Z++b9UcbR3j1kBuQGHO3B0vuJZOgS2+dnuAGsKcenU81t4wpHXO5FqrTX/lnzRMfMh7/A9oP0pcDfh8XbAhLBN9pT+YdK2muapQz+OZ+hSJkBfDWBls1yTG+hTB95CP2h0Evvnhf5SY0ucjuOYMKxDuQLDfhI0eGM3Rj7UnhTxCHsyEErJGc/Q68ntCDjiauiIvqXIA=="
  },
  nonce: 1
};
export const regResponse: RegistrationResponse<PublisherCertificate> = {
  ...regRespAttr,
  type: "RegistrationResponse",
  ...NONCE(regRespAttr, 2)
};

export const getRequest: GetRequest = {
  certType: "PublisherCertificate",
  cas: ["ca.url", "ca2.url"],
  domain: publisherCert1.subject,
  ils: "ils.com",
  type: "GetRequest",
  nonce: 1
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
  ...NONCE(getRespAttr, 2)
};

const audReqAttrs = {
  cas: ["ca.url", "ca2.url"],
  certType: "PublisherCertificate",
  sinceRevision: "0",
  ils: "ils.com",
  type: "AuditRequest",
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
  ...NONCE(audRespAttr, 2)
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

const delReqAttrs1 = {
  cert: applicationCert1,
  type: "DeleteRequest",
  nonce: 1
};
export const deleteRequest1: DeleteRequest<ARPKIApplicationCert> = {
  ...delReqAttrs1,
  type: "DeleteRequest",
  signature: sign(delReqAttrs1, PRIVATE_KEY)
};

export const deleteResponse: DeleteResponse<ARPKIPublisherCert> = {
  ...regResponse,
  request: deleteRequest,
  type: "DeleteResponse"
};

export const getRequest1: GetRequest = {
  certType: "ApplicationCertificate",
  cas: ["ca.url"],
  ils: "ils.com",
  domain: applicationCert1.applicationUrl,
  type: "GetRequest",
  nonce: 1
};

const getResp1Root =
  '{"LogRoot":{"Metadata":"","Revision":"1","RootHash":"owglPnjKEVnXTx10Mk/+HpH5EFSa0ZO5xlzrOYhvcIQ=","Signature":"Vgr6OpBOB5NPoO8SffZhWFKDqws/iZZC36o++CkSzU38yoHLtshrmkKfw1nH8HB0dEWAx5gYyoK47V1SR1imdo0qqpCWuKKc/hB6Ct90bMXIGOADH/pioXA4UywJYdMRZcOIpwMkKQPA85dDOp7blz0Jwbh7IRW5vJsxUT9pmqRddLbDJ9mZav/QPhdex4Q8/3frGeyAYy041KNmKJO/654yHNzm3J/GGev5UZLxAaALeGIeC1Hne+oBoyC76Oe1nh4tFJdPAf5BjqpVy/xJz0Hoi5hDnHvKglkLTI332K7tiM+5hCj3VMojljovpd5T86vs0ukKbAELMPYRPbN7oA==","TimestampNanos":"1546979728771839400","TreeSize":"1"},"Revision":"1","RootHash":"HJC4gVb+0EqQ8H47s+LOGdp9rvlhhEdCls8pu6yPDr8=","Signature":"ZGQkPIezec4tHSIDhQ6N8wIlByn4WeStDADG5s6yuuZv/Z1kVzgt5XBnylWYRgI0hpQtXcVi/2fdJBPu4BvQlv/xF5Jb9yZGiShQJB/cV5DEJTvO4hepswFhgXiOEINDcP45eMCL59ZlXGdGzWpgyunVMvoA1qGe0Ye1ZnWHN2ayqbHd1usBQ75BVIwrjDfX9Dt/9CfLgPH8X0ZD7+9eJNyuF8QA5FQzsEVJJvf0wT2Vz7EoNx2dLIK4+NXW6+r1LK+9opf8rI14k9sRSEEPxPLUme/Ey2XqhcYXYfRtY7EVYWz124u+fFmajJjghs4BBQGTxTa2H7yQGpkLdt4+5A==","TimestampNanos":"1546979731317203400"}';
const getResp1Attr = {
  proof:
    '{"inclusionList":["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],"leaf":{"extraData":"","index":"KOXrq9nY9uI332PaK1A3hQk/AikkG8cCEZj2PEO5Mmk=","leafHash":"sYm8PadM7p9/wogRJ1zG+bCmo8tQibFAVRp9B+Qe57g=","leafValue":"CgN1cmwSvSF7ImFwcGxpY2F0aW9uVXJsIjoidXJsIiwiY2FNaW4iOjIsImNhcyI6WyJjYS51cmwiLCJjYTIudXJsIl0sImRlcGxveW1lbnRWZXJzaW9uIjoxLCJpbHNlcyI6WyJpbHMuY29tIl0sInB1Ymxpc2hlciI6eyJhY2NlcHRhbmNlQ29uZmlybWF0aW9uIjp7ImRhdGEiOnsiZGF0YSI6eyJzaWduYXR1cmUiOiJQdmI3YmJ2VHc4VTFyR1BoT1VTUHJocFY1M3I5cndxOFBrNGdCakxuN2E1TkJOdVJiYk9nMjhDdWtDMkl2YTdzMUs0Wk5kNnBrSEY3TzJ5YTdiU1BBQlN0Ujdzcm5FZ2laR2FZNTFxQkpWUGl1WGpvb0h2SE5oNkRqZTNid2VURlRWWUQ2M09kb3NYbXh0cTlOakprN3BhOWlkbDcvbzVmTWxibXhER0R1bEd6M3A4bUplcFYxc1lBR3IzVkR0MnIyYnA1R3lFQXJBOFltZGtTdFNPVUJaUDlPYTRMUU5DZzkzN0VqblRyQWpPdVl3YlhKanJ6QVJ6bjBIZU01eU02Q2IvQmY0N2NTc29lRTJVY3oyQzJZbnk0ZGRWNVZmR3dCd2hpandJYmdEL3hXQ3VHYkZpeEIremZmdG5KbzZ3ZEJmRnA0dlM0UitnMlBockZ1UWp3ZHc9PSJ9LCJzaWduYXR1cmUiOiJHZTRSN2F2dWloa1FmOU8vTDByMWpJR1pPaDZqVnN0aVF6Q2t6YlNaQlJXVkJreUVMdlBqZndCcVVCaFlPVjBpTFY4bE0wZFFGeEhGcktaWEw2QzF0TnNxQUY1dDZzMmdkcDdkV0R5Z3d2dHg4RGtlc1ZFSFh4emV3OUhqNktDSWI3SlNTenpGNzl4Y2V2ZHhaQ1NMRHZ1dlRRbE15NE8yMDBCenJqOEY4ZEl0eGNEanFUUTZpdGtLYldmSmV4VmIrc2xkeEVIV01RWGtEaUtLUysrUTlLOWg3VFpDY0tFbDNtdFlBeFlzSFIvNnAvWDB1K3hpekFZY0FoQlAvMlNEemRkQm9VMGFQanVHOFVESWdPblRoL0xXR3dRcXcwYnFVN3RRYjdDVnAyZ3lSYjlzbVl6THVaM3NIR0NPTklKS245MHRyVFY0ZS9YME5meUJPSEZuTEE9PSJ9LCJzaWduYXR1cmUiOiJDN2UvQ0NUZmEyYzJZS0lsZEZEeVZLTUlJNWFrelZKVmFLVHVzOStxUWJjWkZXS280YWt6eHlmVThXQlJOejlieWhUdjZ2bk9YaUVqSzlqclF2bDhxT0YybVQ4Q2VYbThNMUJHeGVoUTJ6YTRvQ2pKc0lQVzlHYU1jV1orZ2RlQXgwOW01UGY3eXFqMjZCczAzdkdGYzNjRDZOS3Npa2lzMmJJWlRQaW54dWZzV2dRZjM1M2w2ZzlvcjYyc1BRT3VFRittUndvdEtzZ1VOSXpOdzB3QW9CTE1JVU4yUG9sdVgxbFJUVS85VzNmU2phRGNuVnF6VTdiYlBWS2dlazA1OG04UzZpRGwvQTRBU1JvTmp1SXRlZ1diNmJDWVlLc293TjhKRFpOdXFoRDZjdDJvYTgwYlE4Q1dYN3BvRCtvYjhCbDdWRk0wS2NnYjAxdFJHY1ZtVlE9PSJ9LCJjYU1pbiI6MiwiY2FzIjpbImNhLnVybCIsImNhMi51cmwiXSwiZG9tYWlucyI6WyJ1cmwiXSwiZXhwZWN0ZWRMaWZldGltZSI6ODY0MDAwMDAwMDAwMDAwMCwiaWxzZXMiOlsiaWxzLmNvbSJdLCJzaWduYXR1cmVzIjpbIms5Q1JESlNkRGh0MzM0Z3YwRjk1WVIvOWJCcmQveE9HZFcwM3IyOWVuNUx3QTNWRDYvT3RnUDdmbmdOVkd6SHErd2ZqWTcxak5kdTZrdVRBdm1lMUFVWjZVWGlpVGRzTVdoS3V0M3Z3eUlnbTBxTWVOc1BNMnBucHdOVks4V3hFZTdDcUZzb0dQWEl4SFBNMGduUlpwOEI2RWdSVEFnL0N0Uy9iK1dqSnVjSjZla2pIOHg0K1V1eU1Vb0JHTTc1TTRIbDhsaFZGMUhzODNTUnR6c1d3WDN3OHBPdWxUMHlmQ2NCUTd2djFSRGZNbGIrb2FqeGdhbkIrcWgrbzVhYlcrK0NWU0dwTVgyNUduNk9yaVpFUmNhQkc0TndhUWRrdVI4b05WSzZDV3MyeFBEdmkvR016eWZ6Vmo2MHVmTTJ1ZEhORG9YcVlEWTloYzhMSnN6cGh6UT09IiwiazlDUkRKU2REaHQzMzRndjBGOTVZUi85YkJyZC94T0dkVzAzcjI5ZW41THdBM1ZENi9PdGdQN2ZuZ05WR3pIcSt3ZmpZNzFqTmR1Nmt1VEF2bWUxQVVaNlVYaWlUZHNNV2hLdXQzdnd5SWdtMHFNZU5zUE0ycG5wd05WSzhXeEVlN0NxRnNvR1BYSXhIUE0wZ25SWnA4QjZFZ1JUQWcvQ3RTL2IrV2pKdWNKNmVrakg4eDQrVXV5TVVvQkdNNzVNNEhsOGxoVkYxSHM4M1NSdHpzV3dYM3c4cE91bFQweWZDY0JRN3Z2MVJEZk1sYitvYWp4Z2FuQitxaCtvNWFiVysrQ1ZTR3BNWDI1R242T3JpWkVSY2FCRzROd2FRZGt1UjhvTlZLNkNXczJ4UER2aS9HTXp5ZnpWajYwdWZNMnVkSE5Eb1hxWURZOWhjOExKc3pwaHpRPT0iXSwic3ViamVjdCI6InB1Ymxpc2hlciIsInN1YmplY3RQdWJsaWNLZXkiOnsiZGF0YSI6Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tXG5NSUlCSWpBTkJna3Foa2lHOXcwQkFRRUZBQU9DQVE4QU1JSUJDZ0tDQVFFQXBjRzUvV2Y3Q2I4VC9WTWFrdG43XG5vVmtKd2IvdzU2RkFiUWZMRi8yajMvU240MHhmSzZSL3pvZ1BScUNzb0JoWGxFVVIrY2pMczFEUGxhMFlHSVRFXG5Eamo1UUhtdm1QYWNNOUVhZXdYMUVEM3FwWnBxcHF2eDBRU2gyVFVxVWJQVTU5ajgzdGcvYUJidUFJaXFjdUh6XG5mUFpwNHN4OThOaEVUMEM5WWYxazlQYjVqRVpqM0hqY3hZZnZiMTd3Y3l2UTVOa1ZvaS84MlAya1ZvSWY0QWxzXG5Xa2JCMlhRWTZ6dEltL2NVdjF0THI2TWFDQUx4aXJkNHZhWVBISjdtcDBUZTdQQkZwRFFuNWczTzY1MHV6aWlDXG5yTERDSGZ2WGVaTGd3c282aEtqemxNd2FCcERsZHJwSFRKSWFvVFhkSDFYUlFVblVOKzJhR1o3OHRJSjloaDdsXG5Jd0lEQVFBQlxuLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tIiwiZm9ybWF0IjoicHVibGljIn0sInR5cGUiOiJQdWJsaXNoZXJDZXJ0aWZpY2F0ZSIsInZhbGlkaXR5Ijp7Im5vdEFmdGVyIjo4NjQwMDAwMDAwMDAwMDAwLCJub3RCZWZvcmUiOi04NjQwMDAwMDAwMDAwMDAwfSwidmVyc2lvbiI6MX0sInJlc291cmNlcyI6W3siY29udGVudEhhc2giOiJSQitiYXFTVld3SjZwL2VQY2VmVDZjOXBTMGJ6NzJOdDRBMHRlWVZGdWVUYzEzWktHNE1ndm1NUzFtYWx3NEZKazVmMUlFMmRmamtTTEhTbzlpam5FUm1NYnh4Yi8veTBjaDZyYUNOZGNzb2R1emRpcVNLQjJsc1NzeHZWeG55ZGRVaTc1UzZFMklvVUVvbXp6RncxUUxiemxPQmEvMi9POVJFKzJuWFpQc2d1TitsU2lBNkZDMjVFbjE1NTVXSEpKSDBXQm5nNHpha3hLR1VyS1RhREo5K0NSdUxna1Q5QlB6TUpIME9SWm9NRTJvSW54eVhLakxjMVZyL1FBVExUbEt5WW94SlpxdTQyQWc5NkZJQ3piTUtFT3Y3OWd4MHBpc3ovTnV4SW1wOGdyeXV6ejZrc0VCSGxTRENJVHVwY3ZzbEdYbklXT3Q3c1E1c25laXA1bVE9PSIsInJlc291cmNlVXJsIjoiaHR0cDovL3Jlc291cmNlLmNvbSJ9XSwic2lnbmF0dXJlIjoiSXFSSmQwdGVMb3VjZVpCYzhLVnBIZjBma2FqaTFrdGxSVjVVZ1lLNVhybmdKeEtmNFJ4RWZ1NDBMRW96VmVCc0txNmVaMUMrU0d4TTBTZVhJVUlWeUFZRnVlSi8ycnVtRUhHNUZNWFJwV1JxYnc0YzFkand2SHNtK3dReDB3SjU3Y1M5d2oza01RTm1paU1USFZJdHFKOUxWR08wb3lXdEZ0WFlMRUVxaU9HUmVwZXNpTnBETktTVkpLSmdIVVJKT0NRRTdTTmVDUERoK3hUbkV0d2FDUXVNMFZvRjIrcktiKy80dEd6Vy9sb1ozWkFxVVczSU9vUnYwK1JGRW9IS05lNHRjQ2hYYnpZTXN1dVMzZytONVdWUHBaSnlTNXpQRjYwbHV2aVg4ZzVWSFhOLytVdUhSTmozUzlFWXVaRElvS2dsaEJEUXFVbzhXbjJod2sxbVp3PT0iLCJzaWduYXR1cmVzIjpbImRkUVlQZ1lsT0NFUmRKSUdGaXdzYVpHWmx1VldjRDYydDZkWnQxT0tZWFlrZU1xM0JnQXZRd2k4aGRKd3VRTUMxWWRheU1iampkdGpTUGFrZVo1WGJyUlRBdVZuZTY4cXNhc1NWNzhiYysyUnh2cFZVMjZsRHVtUnBFd3RLSXdzNkx2MkEzNTlBUGNMdkZMVkV4d2RLNEdDM1hiVVlTK3Vkc0FsbnUrVlFWTGxYM01JYWpISFFvcEUrdmhBZmVUekVPakVSK2c3VmlBKzBXSkxJUXNNZ1hnUXg3QUFJaGV2aGx1cUxuVmNPTGl4WVpDTDRlOWdPd1Q3blVTYU4vQk40RVNtZkh0Zk43dWhjK3VmU0hLZHRXSk5qc214RGhuTndtTGNwZW5id2lidWo2eXIvRzE2Z2lUWjBFdVJwVWl4aFNDMXlpR3NOaEk0RlFpb0l1QTQ5Zz09IiwiZGRRWVBnWWxPQ0VSZEpJR0Zpd3NhWkdabHVWV2NENjJ0NmRadDFPS1lYWWtlTXEzQmdBdlF3aThoZEp3dVFNQzFZZGF5TWJqamR0alNQYWtlWjVYYnJSVEF1Vm5lNjhxc2FzU1Y3OGJjKzJSeHZwVlUyNmxEdW1ScEV3dEtJd3M2THYyQTM1OUFQY0x2RkxWRXh3ZEs0R0MzWGJVWVMrdWRzQWxudStWUVZMbFgzTUlhakhIUW9wRSt2aEFmZVR6RU9qRVIrZzdWaUErMFdKTElRc01nWGdReDdBQUloZXZobHVxTG5WY09MaXhZWkNMNGU5Z093VDduVVNhTi9CTjRFU21mSHRmTjd1aGMrdWZTSEtkdFdKTmpzbXhEaG5Od21MY3BlbmJ3aWJ1ajZ5ci9HMTZnaVRaMEV1UnBVaXhoU0MxeWlHc05oSTRGUWlvSXVBNDlnPT0iXSwidHlwZSI6IkFwcGxpY2F0aW9uQ2VydGlmaWNhdGUiLCJ2YWxpZGl0eSI6eyJub3RBZnRlciI6ODY0MDAwMDAwMDAwMDAwMCwibm90QmVmb3JlIjotODY0MDAwMDAwMDAwMDAwMH19"}}',
  proofSignature:
    "KzVRgtlGtCEkO3Ygqp1cGnL8m2Qi8P106Z1xVu5Ypz4RFXCtYv/1kkwWP8vkL6/GI0d2Rjsi1TbGn4o6jnTUUcgpdXATLxlUsObfIZOPdNKf+dF4BtWBM0cfTBRBApWxpLXZQoJNHEGwL5dQpHUYAkKgPEFz2frUaFuLjeG/FZI5wI0lEfK7DM5+gpidvJh6eW/orj7Hq1uiS+TBlGeMO+3dmzY602opZJHUdg8eUc3N7hdDShJdsGj3pHJlglv83QeAvuSwKPVqF66k9CfuQg5s4mlal3BsXtE9dc2DKq5zZUVRb0dSnkTv2r+3Vh+RHkJNdnuDiSeEh+AqyVNlKA==",
  nonce: 1,
  cert: applicationCert1,
  request: getRequest1,
  root: getResp1Root,
  rootSignature: createTestAcc(JSON.parse(getResp1Root), 3),
  type: "GetResponse"
};
export const getResponse1: GetResponse<ApplicationCertificate> = {
  ...getResp1Attr,
  type: "GetResponse",
  ...NONCE(getResp1Attr, 1)
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

export const updateResponse: UpdateResponse<ARPKIPublisherCert> = {
  ...regResponse,
  request: updateRequest1,
  type: "UpdateResponse"
};
