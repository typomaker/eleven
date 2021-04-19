import Koa from "koa";
import env from "../../env";

export function error() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    try {
      await next();
    } catch (err) {
      ctx.body = {
        message: err.message,
        stacktrace: env === "development" ? err.stack?.split("\n") : undefined,
      }
      ctx.status = err.status ?? 500;
      ctx.app.emit("error", err, ctx);
    }
  }
}

export default error;