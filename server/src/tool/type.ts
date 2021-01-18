/**
 * @deprecated
 */
export type Constructor<T extends object, R extends keyof T = any, P extends keyof T = any> = Required<Pick<T, R>> & Partial<Pick<T, P>>;


