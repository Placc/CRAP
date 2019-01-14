type OmitProperties<T extends O, O> = { [P in keyof T]: P }[keyof T] &
  { [P in keyof O]: never }[keyof O];
export type Omit<T, O> = T extends O ? Pick<T, OmitProperties<T, O>> : T;
