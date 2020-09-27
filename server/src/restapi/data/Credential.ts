import Koa from "koa";
import validator from "validator";

export type Credential = (
  | { type: "facebook", token: string }
  | { type: "password", password: string, recaptcha2: string, email: string }
)
export namespace Credential {
  export function from(req: Koa.Request): Credential {
    if (
      !(
        req.body
        &&
        validator.isIn(req.body.type, ["facebook", "password"])
        &&
        (
          (
            req.body.type === "facebook"
            &&
            typeof req.body.token === "string"
          )
          ||
          (
            req.body.type === "password"
            &&
            !validator.isEmpty(req.body.password)
            &&
            !validator.isEmpty(req.body.recaptcha2)
            &&
            validator.isEmail(req.body.email)
          )
        )
      )
    ) throw new Error("InvalidRequest");

    return req.body;
  }
}
export default Credential;