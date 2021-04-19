import Koa from "koa";
import log from "../../logger";
import context from "./context";


export function logger() {
  return async (ctx: Koa.ParameterizedContext<context.State>, next: Koa.Next) => {
    try {
      await next()
    } finally {
      await log.info("request: ", {
        id: ctx.state.id,
        url: ctx.request.originalUrl,
        status: ctx.response.status,
        requestBody: ctx.request.body,
        responseBody: ctx.response.body,
      })
    }
  }
}