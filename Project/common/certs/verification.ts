import { CA, Participant, ILS } from "../participants/types";
import { uniq } from "lodash";
import { ARPKICert, MultiSignature } from "./types";
import { verify } from "../crypto/rsa";
import { compact, cloneDeep, isNil } from "lodash";
import { isILS, isCA } from "../participants/guards";
import { isMultiSignature } from "./guards";
import { stringify } from "../util/funs";
import { CryptoKey } from "../crypto/types";

export const CA_MIN = 2;

export const verifyParticipants = (
  participant: Participant,
  caMin: number,
  subset: { cas?: string[]; ilses?: string[]; ils?: string },
  superset: { cas?: string[]; ilses?: string[]; ils?: string }
) => {
  if (isNil(participant) || isNil(subset) || isNil(superset)) {
    throw new Error("Illegal argument");
  }
  if (
    isNil(subset.cas) ||
    isNil(superset.cas) ||
    subset.cas.length < caMin ||
    superset.cas.length < caMin ||
    subset.cas.length < CA_MIN ||
    superset.cas.length < CA_MIN ||
    uniq(subset.cas).length < subset.cas.length ||
    uniq(superset.cas).length < superset.cas.length ||
    !subset.cas.every(ca => superset.cas!.some(sca => ca === sca)) ||
    (isCA(participant) && !subset.cas.some(p => p === participant.url))
  ) {
    throw new Error("Illegal ca list in request!");
  }

  const subsetIlses = compact([...(subset.ilses || []), subset.ils]);
  const supersetIlses = compact([...(superset.ilses || []), superset.ils]);
  if (
    isNil(subsetIlses) ||
    isNil(supersetIlses) ||
    subsetIlses.length < 1 ||
    supersetIlses.length < 1 ||
    uniq(subsetIlses).length < subsetIlses.length ||
    uniq(supersetIlses).length < supersetIlses.length ||
    !subsetIlses.every(ils => supersetIlses.some(sils => ils === sils)) ||
    (isILS(participant) && !subsetIlses.some(p => p === participant.url))
  ) {
    throw new Error(
      `Illegal ils list in request! Got: ${subsetIlses}, want ${supersetIlses}`
    );
  }
};

export const verifyMultiSignature = (
  data: any,
  multiSignature: MultiSignature,
  participatingCas: CA[],
  headIls: ILS
) => {
  try {
    const { signature } = participatingCas.reduce(
      (confirmation, participant) => {
        if (confirmation.data) {
          if (
            !verify(
              confirmation.data,
              confirmation.signature,
              participant.publicKey
            )
          ) {
            throw new Error(
              `Couldn't verify MultiSignature ${stringify(
                multiSignature
              )} for ${stringify(data)} and participant ${stringify(
                participant
              )}!`
            );
          }
          return confirmation.data;
        }
        return confirmation;
      },
      multiSignature
    );

    return verify(data, signature, headIls.publicKey);
  } catch {
    return false;
  }
};

export const verifyAcceptanceConfirmation = (
  data: any,
  multiSignature: MultiSignature,
  participatingCas: CA[],
  ilses: ILS[],
  publisherKey?: CryptoKey
) => {
  try {
    let mSignature = multiSignature;
    if (publisherKey) {
      mSignature = multiSignature.data!;
      if (!verify(mSignature, multiSignature.signature, publisherKey)) {
        throw new Error("Publisher did not sign acceptanceConfirmation!");
      }
    }

    const { signature } = [
      ...participatingCas,
      ...ilses.slice(1).reverse()
    ].reduce((confirmation, participant) => {
      if (confirmation.data) {
        if (
          !verify(
            confirmation.data,
            confirmation.signature,
            participant.publicKey
          )
        ) {
          throw new Error(
            `Couldn't verify MultiSignature ${stringify(
              multiSignature
            )} for ${stringify(data)} and participant ${stringify(
              participant
            )}!`
          );
        }
        return confirmation.data;
      }
      return confirmation;
    }, mSignature);

    return verify(data, signature, ilses[0].publicKey);
  } catch {
    return false;
  }
};

export const verifyNonceSignature = (
  data: any,
  multiSignature: MultiSignature,
  participatingCas: CA[],
  headIls: ILS
) => {
  const keys = Object.keys(data);
  const newObj = cloneDeep(data);

  for (const key of keys) {
    const prop = data[key];
    if (isMultiSignature(prop)) {
      newObj[key] = participatingCas.reduce(sig => sig.data!, prop);
    }
  }

  return verifyMultiSignature(
    newObj,
    multiSignature,
    participatingCas,
    headIls
  );
};
