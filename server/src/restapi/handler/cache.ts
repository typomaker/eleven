import KoaRouter from "@koa/router";
import Koa from "koa";
import env from "../../env";

export function cache(cnf: { maxAge?: number } = {}): KoaRouter.Middleware {
  return async (ctx: KoaRouter.RouterContext, next: Koa.Next) => {
    cnf.maxAge ??= 3600
    if (env === "production") ctx.set("Cache-Control", `public, max-age=${cnf.maxAge}`)
    await next()
  }
}

export default cache;