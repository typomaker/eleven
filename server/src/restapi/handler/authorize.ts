import KoaRouter from "@koa/router";
import Koa from "koa";
import * as uuid from "uuid";
import validator from "validator";
import * as account from "../../account";

export type Token = string;
export namespace Token {
  export function is(raw: any): raw is Token {
    return raw && validator.isUUID(raw, "4") && raw !== uuid.NIL;
  }
}

export function authorize() {
  return async (ctx: KoaRouter.RouterContext<authorize.State>, next: Koa.Next) => {
    const token = ctx.request.headers.authorization;
    if (!Token.is(token)) return ctx.throw(401, `token ${token} is not valid`);
    try {
      ctx.state.session = await account.authorize(token)
      await next()
    } catch (e) {
      if (e instanceof account.Error.TokenExpired) ctx.throw(401, e)
      if (e instanceof account.Error.TokenNotFound) ctx.throw(401, e)
      ctx.throw(500, e)
    }
  }
}
export namespace authorize {
  export interface State { session: account.entity.Session }
}
export default authorize;