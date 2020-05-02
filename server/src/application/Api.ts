import Router from "@koa/router";
import * as http from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaJson from "koa-json";
import validator from "validator";
import WebSocket from "ws";
import * as entity from "../entity";
import IoC from "./IoC";
import Logger from "./Logger";
export class Api {
  public readonly server = http.createServer();

  constructor(private readonly ioc: IoC) { }

  public readonly http = new class {
    public readonly koa = new Koa();
    public readonly logger: Logger;

    constructor(private readonly api: Api) {
      this.logger = this.api.ioc.logger.tag("REST");
      this.koa.on('error', (err) => {
        this.logger.error(err)
      });
      this.koa.use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          ctx.status = err.status || 500;
          ctx.body = { message: err.message };
          ctx.app.emit('error', err, ctx);
        }
      });
      this.koa.use(bodyParser());
      this.koa.use(koaJson());


      const router = new Router({ strict: true })
      router.post("/session", async (ctx) => {
        const request = Api.Credential.from(ctx.request);
        const token = await this.api.ioc.account.signin({ ...request, ip: ctx.request.ip });
        ctx.body = Api.Session.from(token);
      });
      router.get("/session", async (ctx) => {
        const id = Api.Authorization.from(ctx.request);
        const token = await this.api.ioc.account.authorize({ id });
        ctx.body = Api.Session.from(token);
      });
      router.delete("/session", async (ctx) => {
        const id = Api.Authorization.from(ctx.request);
        await this.api.ioc.account.signout({ id });
        ctx.status = 204;
      });
      this.koa.use(router.routes());
      this.koa.use(router.allowedMethods());

      this.api.server.addListener("request", this.koa.callback())
    }
  }(this)


  public readonly ws = new class WS {
    public readonly server: WebSocket.Server;
    private logger: Logger;
    private pool = new Map<entity.account.User["id"], Set<WebSocket>>()
    constructor(private readonly api: Api) {
      this.logger = this.api.ioc.logger.tag("WS");
      this.server = new WebSocket.Server({ server: this.api.server });

      this.server.on("connection", (ws, req) => new WS.Connection(this.api, ws, req));
      this.server.on("close", this.close.bind(this));
      this.server.on("error", this.error.bind(this));
    }
    private error(err: Error) {
      this.logger.info("error", err);
    }
    private close() {
      this.logger.info("close");
    }
    private static readonly Connection = class Connection {
      private logger: Logger;
      constructor(private readonly api: Api, private readonly ws: WebSocket, private readonly req: http.IncomingMessage) {
        this.logger = this.api.ws.logger.tag("Connection");

        this.ws.on("open", this.open.bind(this));
        this.ws.on("message", this.message.bind(this));
        this.ws.on("close", this.close.bind(this));
        this.ws.on("error", this.error.bind(this));
      }
      private error(err: Error) {
        this.logger.info("error", err)
      }
      private open() {
        this.logger.info("open");
      }
      private close() {
        this.logger.info("close");
      }
      private message(data: WebSocket.Data) {
        this.logger.info("data", data);
      }
    }

  }(this)

  public listen(port = 80) {
    this.server.listen(port);
  }
}
export namespace Api {
  export type Authorization = string;
  export namespace Authorization {
    export function from(req: Koa.Request): Authorization {
      const v = req.headers.authorization;
      if (!v || !validator.isUUID(v)) throw new Error("AuthorizationRequired");
      return v;
    }
  }
  export type Credential = (
    | { type: "facebook", token: string }
    | { type: "password", password: string, recaptcha2: string, email: string }
  )
  export namespace Credential {
    export function from(req: Koa.Request): Credential {
      if (
        !(
          req.body
          &&
          validator.isIn(req.body.type, ["facebook", "password"])
          &&
          (
            (
              req.body.type === "facebook"
              &&
              validator.isLength(req.body.token, { min: 255, max: 255 })
            )
            ||
            (
              req.body.type === "password"
              &&
              !validator.isEmpty(req.body.password)
              &&
              !validator.isEmpty(req.body.recaptcha2)
              &&
              validator.isEmail(req.body.email)
            )
          )
        )
      ) throw new Error("InvalidRequest");

      return req.body;
    }
  }
  export type User = {
    id: string
    name: string
    avatar?: string
  }
  export type Session = {
    id: string
    expired?: string
    user: User
  }
  export namespace Session {
    export function from(token: entity.account.Token): Session {
      return {
        id: token.id,
        expired: token.expired?.toISOString() ?? undefined,
        user: {
          id: token.user.id,
          name: token.user.name,
          avatar: token.user.avatar ?? undefined,
        }
      }
    }
  }
}