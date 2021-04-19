import KoaRouter from "@koa/router";
import { localization } from "../../mongo";
export function dictionary() {
  return async (ctx: KoaRouter.RouterContext) => {
    for (const key of [ctx.params.language, "en"]) {
      ctx.body = await localization.dictionary(key);
      if (ctx.body) break;
    }
    ctx.body ??= {}
  }
}
export default dictionary;