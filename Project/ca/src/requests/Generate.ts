import {
  GenerateRequest,
  isGenerateRequest,
  GenerateResponse
} from "common/communication/requests/Generate";
import { toLower, isEqual } from "lodash";
import { CryptoKey } from "common/crypto/types";
import { Publisher, CA, Auditor } from "common/participants/types";
import {
  isPublisherCertificate,
  isAuditionCertificate,
  isApplicationCertificate
} from "common/certs/guards";
import { sign } from "common/crypto/rsa";
import { verifyParticipants, CA_MIN } from "common/certs/verification";
import { Certificate } from "common/certs/types";

export const isValidGenerateRequest = <C extends Certificate>(
  isValidCert: (cert: any) => Promise<boolean>
) => async (obj: GenerateRequest<C>): Promise<boolean> => {
  return isGenerateRequest<C>(obj) && (await isValidCert(obj.cert));
};

const readUserAcceptance = async (): Promise<boolean> => {
  if (process.env.ALWAYS_ACCEPT && process.env.ALWAYS_ACCEPT == "true") {
    process.stdout.write(
      "The certificate is accepted as ALWAYS_ACCEPT is set to true.\n\n"
    );
    return Promise.resolve(true);
  }
  const result = await new Promise<string>(resolve => {
    process.stdin.resume();
    process.stdout.write("Do you want to accept and sign the request? [y/n]: ");
    process.stdin.on("data", function(data) {
      process.stdin.pause();
      const response = toLower(data.toString().trim());
      resolve(response);
    });
  });

  if (result === "y") {
    return true;
  } else if (result === "n") {
    return false;
  } else {
    return await readUserAcceptance();
  }
};

export const processGenerateRequest = <C extends Certificate>(
  thisCA: CA,
  privateKey: CryptoKey
) => async (
  requester: Publisher | Auditor,
  request: GenerateRequest<C>
): Promise<GenerateResponse<C>> => {
  verifyParticipants(thisCA, CA_MIN, request.cert, request.cert);

  process.stdout.write(
    "Received a new ARPKI Certificate Generation Request:\n"
  );
  process.stdout.write("The certificate to be signed is the following:\n\n");
  process.stdout.write(JSON.stringify(request.cert, null, 2) + "\n\n");

  const { ilses, ilsTimeout, cas, caMin, ...rawCert } = request.cert as any;

  if (isAuditionCertificate(rawCert)) {
    if (!isEqual(requester.publicKey, rawCert.auditor.subjectPublicKey)) {
      throw new Error("Invalid auditor public key!");
    }

    process.stdout.write(
      "The auditor property is a valid registered cert. It will be signed automatically.\n"
    );
  } else if (isApplicationCertificate(rawCert)) {
    if (!isEqual(requester.publicKey, rawCert.publisher.subjectPublicKey)) {
      throw new Error("Invalid publisher public key!");
    }

    process.stdout.write(
      "The publisher property is a valid registered cert. It will be signed automatically.\n"
    );
  } else if (isPublisherCertificate(rawCert)) {
    if (!isEqual(requester.publicKey, rawCert.subjectPublicKey)) {
      throw new Error("Invalid publisher public key!");
    }

    const response = await readUserAcceptance();

    if (!response) {
      throw new Error("Certificate registration request declined!");
    }
  }

  const rawResponse = {
    type: "GenerateResponse",
    request,
    certSignature: sign(request.cert, privateKey),
    nonce: request.nonce
  };

  const generateResponse: GenerateResponse<C> = {
    ...rawResponse,
    type: "GenerateResponse",
    nonceSignature: {
      signature: sign(rawResponse, privateKey)
    }
  };

  return generateResponse;
};
