import { ILS, CA, Participant } from "common/participants/types";
import {
  RequestType,
  ProtocolHandler,
  Server
} from "common/communication/types";
import { CertificateType, Certificate } from "common/certs/types";
import { compact, head } from "lodash";
import {
  GetResponse,
  isGetResponse,
  GetRequest
} from "common/communication/requests/Get";
import { isCA, isILS } from "common/participants/guards";
import { sign } from "common/crypto/rsa";
import { CreateNonce, getHash, stringify } from "common/util/funs";
import { CryptoKey } from "common/crypto/types";
import { RequestAwaiter } from "common/communication/awaiter";

const DOMAIN_MAP = new Map<string, RequestAwaiter<any>[]>();

export const createCertificateObserver = <
  C extends Certificate
>(): ProtocolHandler<CA | ILS, GetResponse<C>> => ({
  handle: (_, res) => {
    const hash = getHash(res.request);
    if (DOMAIN_MAP.has(hash)) {
      const awaiters = DOMAIN_MAP.get(hash)!;
      DOMAIN_MAP.delete(hash);

      for (const awaiter of awaiters) {
        awaiter.resolve(res);
      }
    }
    return Promise.reject("CertificateObserver handle");
  },
  validContent: res => Promise.resolve(DOMAIN_MAP.has(getHash(res.request))),
  validRequest: (req): req is GetResponse<C> => isGetResponse<C>(req),
  validSender: (sender): sender is CA | ILS => isCA(sender) || isILS(sender)
});

export const createQueryCertificateHandler = <C extends Certificate>(
  thisUrl: string,
  privateKey: CryptoKey,
  queryParticipant: (url: string) => Promise<Participant>,
  certType: CertificateType
) => (signingCAs: string[], knownILSes: string[]) => async (
  domain: string
): Promise<C> => {
  const awaiters = new Array<Promise<GetResponse<C> | undefined>>();
  for (const ilsUrl of knownILSes) {
    const ils = await queryParticipant(ilsUrl);

    if (!isILS(ils)) {
      throw new Error("Given ils url doesn't belong to a ILS!");
    }

    const request: GetRequest = {
      type: "GetRequest",
      ils: ilsUrl,
      cas: signingCAs,
      domain,
      certType,
      nonce: CreateNonce()
    };

    const hash = getHash(request);

    const guard = (res): res is GetResponse<C> => isGetResponse<C>(res);
    const awaiter = new RequestAwaiter<GetResponse<C>>(guard);

    DOMAIN_MAP.set(hash, (DOMAIN_MAP.get(hash) || []).concat(awaiter));

    try {
      await ils.send("get", request);

      awaiters.push(
        awaiter.toPromise().catch(e => {
          console.log(
            `QueryCertificateHandler: Couldn't get from ${ils.url}: ${
              e.message
            }\n${e.stack}`
          );
          return undefined;
        })
      );
    } catch (error) {
      console.log(
        `QueryCertificateHandler: Bad ils response: ${error.message}\n${
          error.stack
        }`
      );
      const array = DOMAIN_MAP.get(hash) || [];
      array.pop();
      DOMAIN_MAP.set(hash, array);
      continue;
    }
  }

  return await Promise.all(awaiters).then(
    array => head(compact(array.map(res => (res ? res.cert : undefined))))!
  );
};
