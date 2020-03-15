import http from "http";
import validator from "validator";
import WebSocket from "ws";
import * as entity from "../entity";
import Account from "./Account";
import Container from "./Container";
import Logger from "./Logger";
class WSocket {
  private pool = new Map<entity.Account["id"], Set<WebSocket>>();
  private server?: WebSocket.Server;
  private logger: Logger;
  constructor(private readonly container: Container) {
    this.logger = this.container.logger.tag(WSocket.name);
  }

  public start() {
    this.stop();
    this.server = new WebSocket.Server({ port: 80 });
    this.server.on("connection", this.connection.bind(this));
  }
  public stop() {
    if (!this.server) return;
    this.server.close();
    this.server = undefined;
  }
  private async connection(ws: WebSocket, req: http.IncomingMessage) {
    let token: entity.Token | undefined;
    const reply = (msg: WSocket.Message) => {
      const text = WSocket.Message.stringify(msg);
      ws.send(text, e => this.logger.error(e));
    };
    const send = (id: entity.Account["id"], msg: WSocket.Message) => {
      const text = WSocket.Message.stringify(msg);
      for (const ws of this.pool.get(id) ?? []) {
        ws.send(text, e => this.logger.error(e));
      }
    };
    const register = (id: entity.Account["id"], ws: WebSocket) => {
      if (!this.pool.has(id)) this.pool.set(id, new Set());
      this.pool.get(id)!.add(ws);
    };
    const unregister = (id: entity.Account["id"], ws: WebSocket) => {
      this.pool.get(id)?.delete(ws);
      if (this.pool.get(id)?.size === 0) this.pool.delete(id);
    };
    ws.on("open", () => this.logger.info("open"));
    ws.on("close", async (code: number, reason: string) => {
      if (token) {
        token = await this.container.account.signout({ id: token.id });
        unregister(token.owner.id, ws);
      }
    });
    ws.on("error", (err) => this.logger.error(err));
    ws.on("message", async (data: WebSocket.Data) => {
      this.logger.info("message", data);
      const message = JSON.parse(data.toString());
      try {
        if (!WSocket.Message.is(message)) {
          throw new Error("InvalidMessage");
        }
        switch (message.type) {
          case "signin": {
            if (message.payload.type === "token") {
              token = await this.container.account.authorize({ id: message.payload.id });
            } else {
              token = await this.container.account.signin({ ...message.payload, ip: req.connection.remoteAddress });
            }
            register(token.owner.id, ws);
            reply(WSocket.Message.Token.make(token));
            reply(WSocket.Message.Token.Account.make(token.owner));
            break;
          }
          case "signout": {
            token = await this.container.account.signout({ id: message.payload.id });
            unregister(token.owner.id, ws);
            ws.close();
          }
        }
      } catch (e) {
        this.logger.warning("", e);
        reply(WSocket.Message.Error.make(e));
      }
    });
  }
}
namespace WSocket {
  export type Message = (
    | Message.Error
    | Message.Signin
    | Message.Signout
    | Message.Token
    | Message.Token.Account
  );
  export namespace Message {
    export function stringify(msg: Message): string {
      return JSON.stringify(msg);
    }
    export function is(data: any): data is Message {
      switch (data?.type) {
        case "signin": return Signin.is(data);
        case "signout": return Signout.is(data);
      }
      return false;
    }
    export interface Error {
      type: "error";
      payload: { text: string };
    }
    export namespace Error {
      export function make(e: any): Error {
        const v: Error = { type: "error", payload: { text: "Internal" } };
        if (e instanceof Account.Error) {
          v.payload.text = e.message;
        }
        return v;
      }
    }
    export interface Signin {
      type: "signin";
      payload: (
        | { type: "token", id: string }
        | { type: "facebook", token: string }
        | { type: "password", password: string, email: string, recaptcha2: string }
      );
    }
    export namespace Signin {
      export function is(data: any): data is Signin {
        if (data?.type !== "signin") return false;
        switch (data.payload?.type) {
          case "token":
            return validator.isUUID(data?.payload?.id);
          case "password":
            return !validator.isEmpty(data?.payload?.password) && !validator.isEmpty(data?.payload?.email) && !validator.isEmpty(data?.payload?.recaptcha2);
          case "facebook":
            return !validator.isEmpty(data?.payload?.token);
        }
        return false;
      }
    }
    export interface Signout {
      type: "signout";
      payload: { id: string };
    }
    export namespace Signout {
      export function is(data: any): data is Signout {
        return data?.type === "signout" && validator.isUUID(data?.payload?.id);
      }
    }
    export interface Token {
      type: "session";
      payload: { id: string, expired?: string };
    }
    export namespace Token {
      export function make(v: entity.Token): Token {
        return { type: "session", payload: { id: v.id, expired: v.expired?.toISOString() } };
      }

      export interface Account {
        type: "session.account";
        payload: { id: string, name: string, avatar: string | null };
      }
      export namespace Account {
        export function make(v: entity.Account): Account {
          return { type: "session.account", payload: { id: v.id, avatar: v.avatar, name: v.name } };
        }
      }
    }
  }
}

export default WSocket;
