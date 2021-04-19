import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaJson from "koa-json";
import Logger from "../logger";
import * as handler from "./handler";
import router from "./router";
const koa = new Koa();
koa.on("error", (err) => Logger.error(err));

koa.use(handler.error());
koa.use(handler.logger());
koa.use(cors({ origin: `*` }))
koa.use(bodyParser());
koa.use(koaJson());
koa.use(router.routes());
koa.use(router.allowedMethods());

export function callback() {
  return koa.callback();
}

export default callback();