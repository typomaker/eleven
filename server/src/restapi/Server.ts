import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaJson from "koa-json";
import { Application } from "../service";
import Logger from "../service/Logger";
import Router from "./Router";

export class Server {
  public readonly koa = new Koa();
  private readonly router = new Router(this.app);
  private readonly logger: Logger
  constructor(private readonly app: Application) {
    this.logger = app.logger.wrap(Server.name)
    this.koa.on('error', (err) => {
      this.logger.error(Server, err)
    });
    this.koa.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status ?? 500;
        ctx.body = { message: err.message };
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