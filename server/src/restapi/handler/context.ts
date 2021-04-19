import Koa from "koa";
import * as uuid from "uuid";
export function context() {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    ctx.state.id = uuid.v4()
    await next();
  }
}
export namespace context {
  export interface State { id: string }
}

export default context;