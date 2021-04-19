import KoaRouter from "@koa/router";
import validator from "validator";
import * as account from "../../account";
export type Request = (
  | { type: "fb", token: string }
  | { type: "pw", password: string, recaptcha2: string, email: string, name: string }
);
export namespace Request {
  export function is(raw: any): raw is Request {
    return (
      (
        raw?.type === "fb"
        && !validator.isEmpty(raw?.token ?? "")
      )
      ||
      (
        raw?.type === "pw"
        && typeof raw?.email === "string" && validator.isEmail(raw?.email ?? "")
        && typeof raw?.password === "string" && !validator.isEmpty(raw?.password ?? "")
        && typeof raw?.recaptcha2 === "string" && !validator.isEmpty(raw?.recaptcha2 ?? "")
      )
    )
  }
}
export function signup() {
  return async (ctx: KoaRouter.RouterContext) => {
    const body = ctx.request.body;
    if (!Request.is(body)) return ctx.throw("body isn`t valid", 400);
    const session = await account.signin(body)
    ctx.body = session;
  }
}