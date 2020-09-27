import Koa from "koa";
import validator from "validator";

export type Authorization = string;
export namespace Authorization {
  export function create(req: Koa.Request): Authorization {
    const v = req.headers.authorization;
    if (!v || !validator.isUUID(v)) throw new Error("AuthorizationRequired");
    return v;
  }
}
export default Authorization;