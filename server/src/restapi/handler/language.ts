import KoaRouter from "@koa/router";
import { localization } from "../../mongo";
export function language() {
  return async (ctx: KoaRouter.RouterContext) => {
    ctx.body = localization.language();
  }
}
export default language;