import KoaRouter from "@koa/router";
import Koa from "koa";
import * as app from "../app";
import Logger from "../app/Logger";
import * as account from "./../account";
import * as request from "./request";
import * as response from "./response";
export class Router extends KoaRouter {
  private readonly logger: Logger;
  constructor(private readonly app: app.Container) {
    super({ strict: true })
  this.logger = this.app.logger.wrap(Router.name)

    this.post("/", (ctx) => {
      ctx.status = 201;
    })

    this.post("/sign", async (ctx: KoaRouter.RouterContext) => {
      const body = ctx.request.body;
      if (!request.Credential.is(body)) return ctx.throw(400);
      const session = await this.app.account.signin(body)
      ctx.body = response.Session.create(session);
    });

    this.delete("/sign", this.authorize(), async (ctx: KoaRouter.RouterContext<{ session: account.entity.Session }>) => {
      try {
        await this.app.account.signout(ctx.state.session.id);
      } finally {
        ctx.status = 205;
      }
    });
    this.get("/localization", async (ctx: KoaRouter.RouterContext) => {
      const languages = await this.app.mongodb.db('localization').collection('language').find().toArray();
      const result: { [K: string]: string } = {};
      for (const language of languages) {
        result[language._id] = language.display;
      }
      ctx.body = result;
    })
    this.get("/localization/:language", this.cache({ maxAge: 14400 }), async (ctx: KoaRouter.RouterContext) => {
      const keys = [ctx.params.language, 'en']
      do {
        const key = keys.shift();
        const words = await this.app.mongodb.db('localization').collection('dictionary').find({ [key]: { $exists: true } }).toArray();
        if (!words.length) continue;
        const result: { [K: string]: string } = {};
        for (const word of words) {
          result[word.key] = word[key];
        }
        ctx.body = result;
        break;
      } while (keys.length)
    })
  }
  private cache(p: { maxAge?: number } = {}): KoaRouter.Middleware {
    return async (ctx: KoaRouter.RouterContext, next: Koa.Next) => {
      p.maxAge ??= 3600
      if (this.app.config.env === 'production') ctx.set('Cache-Control', `public, max-age=${p.maxAge}`)
      await next()
    }
  }
  private authorize(): KoaRouter.Middleware<{ session: account.entity.Session }> {
    return async (ctx: KoaRouter.RouterContext<{ session: account.entity.Session }>, next: Koa.Next) => {
      const token = ctx.request.headers.authorization;
      if (!request.Authorization.is(token)) return ctx.throw(401, `token ${token} is not valid`);
      try {
        ctx.state.session = await this.app.account.authorize(token)
        await next()
      } catch (e) {
        if (e instanceof account.Service.Error.TokenExpired) ctx.throw(401, e)
        if (e instanceof account.Service.Error.TokenNotFound) ctx.throw(401, e)
        ctx.throw(500, e)
      }
    }
  }
}

export default Router;