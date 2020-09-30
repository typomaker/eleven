import KoaRouter from "@koa/router";
import { Context } from "koa";
import * as app from "../app";
import Logger from "../app/Logger";
import * as data from "./data";

export class Router extends KoaRouter {
  private readonly logger: Logger;
  constructor(private readonly app: app.Container) {
    super({ strict: true })
    this.logger = this.app.logger.wrap(Router.name)

    this.post("/session", this.sessionCreate.bind(this));
    this.get("/session", this.sessionRead.bind(this));
    this.delete("/session", this.sessionDelete.bind(this));
  }

  private async sessionCreate(ctx: Context) {
    const request = data.Credential.from(ctx.request);
    const token = await this.app.account.signin({ ...request, ip: ctx.request.ip });
    ctx.body = data.Session.create(token);
  }

  private async sessionRead(ctx: Context) {
    const id = data.Authorization.create(ctx.request);
    const token = await this.app.account.authorize({ id });
    ctx.body = data.Session.create(token);
  }

  private async sessionDelete(ctx: Context) {
    const id = data.Authorization.create(ctx.request);
    await this.app.account.signout({ id });
    ctx.status = 204;
  }
}

export default Router;