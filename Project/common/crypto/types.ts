export type Signed<T> = T & { signature: string };

export type CryptoKey = {
  data: string;
  format: string;
};
