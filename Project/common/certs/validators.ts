import { isWebUri } from "valid-url";
import { head, isUndefined, isEqual, isEmpty, zip, isNil } from "lodash";
import {
  PublisherCertificate,
  ApplicationCertificate,
  MultiSignature
} from "./types";
import { Participant, CA, ILS } from "../participants/types";
import {
  isValidity,
  isResource,
  isAuditProperty,
  isARPKICert,
  isMultiSignature
} from "./guards";
import { isAssertion } from "../assertions/guards";
import assertions from "../assertions";
import { verify, decryptPublic } from "../crypto/rsa";
import { isString } from "util";
import { getHash, stringify } from "../util/funs";
import { verifyMultiSignature } from "./verification";
import { isValidCryptoKey } from "../crypto/validators";

export const MIN_CAS = 2;

export function isValidURL(obj: any): boolean {
  return isString(obj) && !isUndefined(isWebUri(obj));
}

export function isValidValidity(obj: any): boolean {
  const now = Date.now();
  return isValidity(obj) && obj.notBefore < now && obj.notAfter > now;
}

export function isValidResource(obj: any): boolean {
  const base64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
  return (
    isResource(obj) &&
    isValidURL(obj.resourceUrl) &&
    base64.test(obj.contentHash)
  );
}

export function isValidAssertion(obj: any): boolean {
  return (
    isAssertion(obj) &&
    assertions.some(
      assertion =>
        assertion.assertionIdentifier == obj.assertionIdentifier &&
        assertion.assertionName == obj.assertionName
    )
  );
}

export function isValidAuditProperty(obj: any): boolean {
  return (
    isAuditProperty(obj) &&
    !isEmpty(obj.property) &&
    !isEmpty(obj.description) &&
    (isUndefined(obj.assertions) || obj.assertions.every(isValidAssertion))
  );
}

export async function isValidARPKICert(
  obj: any,
  queryParticipant: ((id: string) => Promise<Participant>) | undefined,
  caList?: CA[] | undefined
): Promise<boolean> {
  if (
    !isARPKICert(obj) ||
    isEmpty(obj.ilses) ||
    isEmpty(obj.cas) ||
    obj.caMin < MIN_CAS
  ) {
    return false;
  }

  const cas =
    caList || (await Promise.all(obj.cas.map(url => queryParticipant!(url))));

  const { signatures, ...rawCert } = obj;

  return zip(signatures, cas).every(
    ([signature, ca]) =>
      !isNil(signature) &&
      !isNil(ca) &&
      verify(rawCert, signature, ca.publicKey)
  );
}

export const isValidPublisherCertificate = (
  queryExisting: (key: string) => Promise<PublisherCertificate>,
  queryParticipant: (id: string) => Promise<Participant>,
  validateExisting: boolean,
  ignoreArpkiProperties?: boolean
) => async (obj: any): Promise<boolean> => {
  if (
    !ignoreArpkiProperties &&
    !(await isValidARPKICert(obj, queryParticipant))
  ) {
    console.log(
      "isValidPublisherCertificate: Not a valid ARPKI Publisher Cert!"
    );
    return false;
  }

  if (!isValidCryptoKey(obj.subjectPublicKey)) {
    console.log(
      "isValidPublisherCertificate: Not a valid publisher public key! (" +
        stringify(obj) +
        ")"
    );
  }
  if (isEmpty(obj.subject)) {
    console.log(
      "isValidPublisherCertificate: Not a valid publisher name! (" +
        stringify(obj) +
        ")"
    );
    return false;
  }

  try {
    const existingCerts = await queryExisting(obj.subject);

    if (validateExisting && !isEqual(existingCerts, obj)) {
      console.log(
        `isValidPublisherCertificate: Existing not equal! ${stringify(
          obj
        )}\n\n${stringify(existingCerts)}`
      );
      return false;
    } else if (
      !validateExisting &&
      (existingCerts.validity.notBefore > obj.validity.notBefore ||
        existingCerts.version >= obj.version)
    )
      return false;
  } catch (e) {
    if (validateExisting) {
      console.log(
        `isValidPublisherCertificate: Couldn't get publisher to validate (${
          e.message
        }\n${e.stack})`
      );
      return false;
    }
    //No cert exists
  }

  if (!isValidValidity(obj.validity)) {
    console.log(
      `isValidPublisherCertificate: Not a valid Publisher validity!` +
        stringify(obj)
    );
    return false;
  }

  if (obj.expectedLifetime < 0) {
    //TODO find better condition
    return false;
  }

  return true;
};

export const isValidApplicationCertificate = (
  queryPublisher: (key: string) => Promise<PublisherCertificate>,
  queryParticipant: (id: string) => Promise<Participant>,
  ignoreArpkiProperties?: boolean
) => async (obj: any): Promise<boolean> => {
  if (
    !ignoreArpkiProperties &&
    !(await isValidARPKICert(obj, queryParticipant))
  ) {
    console.log(
      `isValidApplicationCertificate: Invalid ARPKI cert!\n${stringify(obj)}`
    );
    return false;
  }

  if (
    obj.deploymentVersion < 1 ||
    isEmpty(obj.applicationUrl) ||
    !isValidValidity(obj.validity)
  ) {
    console.log(
      `isValidApplicationCertificate: Invalid deploymentVersion/applicationUrl/validity!\n${stringify(
        obj
      )}`
    );
    return false;
  }

  const validPublisher = await isValidPublisherCertificate(
    queryPublisher,
    queryParticipant,
    true
  );
  if (
    !(await isValidRegisteredCert(
      obj.publisher,
      queryParticipant,
      validPublisher
    ))
  ) {
    console.log(
      `isValidApplicationCertificate: Invalid Publisher cert!\n${stringify(
        obj
      )}`
    );
    return false;
  }

  const registeredDomain = obj.publisher.domains.some(domain => {
    return new RegExp(domain).test(obj.applicationUrl);
  });
  if (!registeredDomain) {
    console.log(
      `isValidApplicationCertificate: Invalid domain!\n${stringify(obj)}`
    );
    return false;
  }

  if (
    !isUndefined(obj.assertions) &&
    obj.assertions.some(assertion => !isValidAssertion(assertion))
  ) {
    console.log(
      `isValidApplicationCertificate: Invalid assertions!\n${stringify(obj)}`
    );
    return false;
  }

  if (obj.resources.some(resource => !isValidResource(resource))) {
    console.log(
      `isValidApplicationCertificate: Invalid resources!\n${stringify(obj)}`
    );
    return false;
  }

  const { signature, signatures, ...rawCert } = obj;

  if (!verify(rawCert, signature, obj.publisher.subjectPublicKey)) {
    console.log(
      `isValidApplicationCertificate: Invalid signature!\n${stringify(obj)}`
    );
    return false;
  }

  return true;
};

export const isValidAuditionCertificate = (
  queryApplication: (key: string) => Promise<ApplicationCertificate>,
  queryPublisher: (key: string) => Promise<PublisherCertificate>,
  queryParticipant: (id: string) => Promise<Participant>,
  ignoreArpkiProperties?: boolean
) => async (obj: any): Promise<boolean> => {
  if (
    !ignoreArpkiProperties &&
    !(await isValidARPKICert(obj, queryParticipant))
  ) {
    console.log(
      `isValidAuditionCertificate: Not a valid ARPKI Audition Cert!` +
        stringify(obj)
    );
    return false;
  }

  if (isEmpty(obj.methods) || !isValidValidity(obj.validity)) {
    console.log(
      "isValidAuditionCertificate: Not a valid Auditor methods array or auditor validity!" +
        stringify(obj)
    );
    return false;
  }

  const validAuditor = await isValidPublisherCertificate(
    queryPublisher,
    queryParticipant,
    true
  );

  if (
    !(await isValidRegisteredCert(obj.auditor, queryParticipant, validAuditor))
  ) {
    console.log(
      `isValidAuditionCertificate: Not a valid registered Publisher Cert!` +
        stringify(obj)
    );
    return false;
  }

  if (obj.properties.some(property => !isValidAuditProperty(property))) {
    console.log(
      `isValidAuditionCertificate: Not a valid AuditProperty array!` +
        stringify(obj)
    );
    return false;
  }
  if (obj.resources.some(resource => !isValidResource(resource))) {
    console.log(`isValidAuditionCertificate: Not a valid Resource array!`);
    +stringify(obj);
    return false;
  }

  const application = await queryApplication(obj.application);

  if (application.deploymentVersion == obj.applicationVersion) {
    console.warn(
      "isValidAuditionCertificate: The version doesn't match the registered application version!"
    );
  }
  if (
    obj.resources.some(
      resource =>
        !application.resources.some(appres => isEqual(resource, appres))
    )
  ) {
    console.warn(
      "isValidAuditionCertificate: The resources contain an unregistered entry!"
    );
  }

  const { signature, signatures, ...rawCert } = obj;

  if (!verify(rawCert, signature, obj.auditor.subjectPublicKey)) {
    console.log(
      `isValidAuditionCertificate: Not a valid signature!` + stringify(obj)
    );
    return false;
  }

  return true;
};

export const isValidRegisteredCert = async (
  obj: any,
  queryParticipant: (id: string) => Promise<Participant>,
  isValidCert: (c: any) => Promise<boolean>
): Promise<boolean> => {
  if (!isNil(obj) && isMultiSignature(obj.acceptanceConfirmation)) {
    const { acceptanceConfirmation, ...arpkiCert } = obj;

    const validCert = await isValidCert(arpkiCert);
    if (!validCert) {
      console.log("isValidRegisteredCert: Not a valid cert!" + stringify(obj));
      return false;
    }

    const { cas, ilses } = arpkiCert;

    const participatingCas = (await Promise.all(
      [...cas].map(async p => await queryParticipant(p))
    )) as CA[];

    const ilsUri = head(ilses)! as string;
    const headIls = (await queryParticipant(ilsUri)) as ILS;

    if (
      !verifyMultiSignature(
        arpkiCert,
        acceptanceConfirmation,
        participatingCas,
        headIls
      )
    ) {
      console.log(
        "isValidRegisteredCert: Not a valid multi signature!" + stringify(obj)
      );
      return false;
    }

    return true;
  }

  console.log(
    "isValidRegisteredCert: Not a valid registered cert!" + stringify(obj)
  );
  return false;
};
