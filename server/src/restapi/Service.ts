import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaJson from "koa-json";
import * as account from "../account";
import * as app from "../app";
import Logger from "../app/Logger";
import Router from "./Router";
export class Service {
  public readonly koa = new Koa();
  private readonly router = new Router(this.app);
  private readonly logger: Logger
  constructor(private readonly app: app.Container) {
    this.logger = app.logger.wrap(Service.name)
    this.koa.on('error', (err) => {
      this.logger.error(err)
    });
    this.koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status ?? 500;
        const body: any = { message: err.message }
        if (this.app.config.env === "development") {
          body.stack = err.stack
        }
        if (err instanceof account.Service.Error) ctx.status = 400
        ctx.body = body;
        ctx.app.emit('error', err, ctx);
      }
    });
    this.koa.use(cors({ origin: `https://${this.app.config.domain}` }))
    this.koa.use(bodyParser());
    this.koa.use(koaJson());

    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.app.server.addListener("request", this.koa.callback())
  }
}