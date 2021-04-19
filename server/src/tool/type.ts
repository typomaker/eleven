/**
 * @deprecated
 */
export type Constructor<T extends object, R extends keyof T = any, P extends keyof T = any> = Required<Pick<T, R>> & Partial<Pick<T, P>>;
export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;


