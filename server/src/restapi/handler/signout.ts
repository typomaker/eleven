import KoaRouter from "@koa/router";
import * as account from "../../account";
import authorize from "./authorize";

export function signout() {
  return async (ctx: KoaRouter.RouterContext<authorize.State>) => {
    try {
      const session = await account.signout(ctx.state.session.uuid);
      ctx.body = session;
    } finally {
      ctx.status = 205;
    }
  }
}