import * as nats from "ts-nats";
import validator from "validator";
import * as entity from "../entity";
import Account from "./Account";
import Container from "./Container";

type Message = (
  | Message.Failure
  | Message.Success
  | Message.Token
  | Message.Token.Create
  | Message.Token.Delete
  | Message.Token.Get
  | Message.Account
  | Message.Account.Get
)
namespace Message {
  export type Failure = { type: "Failure", payload: string }
  export function Failure(payload: string): Failure {
    return { type: "Failure", payload }
  }

  export namespace Failure {
    export const Invalid = Failure("Invalid")
    export const Unexpected = Failure("Unexpected")
    export const Internal = Failure("Internal")
  }

  export type Success = { type: "Success" }
  export function Success(): Success {
    return { type: "Success" }
  }

  export type Token = { type: "Token", payload: { id: string, expired?: Date } }
  export function Token(token: entity.Token): Token {
    return { type: "Token", payload: { id: token.id, expired: token.expired ?? undefined } }
  }
  export namespace Token {
    export type Create = { type: "Token:create", payload: { type: "password" | "facebook", data: string, email: string } }
    export function Create(payload: Create["payload"]): Create {
      return { type: "Token:create", payload }
    }
    export namespace Create {
      export function is(target: any): target is Create {
        if (target?.type !== "Token:create") return false
        if (!validator.isIn(target?.payload?.type ?? "", ["password", "facebook",])) return false
        if (validator.isEmpty(target?.payload?.data ?? "")) return false;
        if (!validator.isEmail(target?.payload?.email ?? "")) return false;
        return true
      }
    }
    export type Delete = { type: "Token:delete", payload: { token: string } }
    export function Delete(payload: Delete["payload"]): Delete {
      return { type: "Token:delete", payload }
    }
    export namespace Delete {
      export function is(target: Delete | any): target is Delete {
        if (target?.type !== "Token:delete") return false
        if (validator.isEmpty(target?.token)) return false
        return true;
      }
    }
    export type Get = { type: "Token:get", payload: { token: string } }
    export function Get(payload: Get["payload"]): Get {
      return { type: "Token:get", payload }
    }
    export namespace Get {
      export function is(target: Get | any): target is Get {
        if (target?.type !== "Token:get") return false
        if (validator.isEmpty(target?.token)) return false
        return true;
      }
    }
  }

  export type Account = { type: "Account", payload: Pick<entity.Account, "id" | "avatar" | "name"> }
  export function Account(account: entity.Account): Account {
    return { type: "Account", payload: { id: account.id, avatar: account.avatar, name: account.name } }
  }

  export namespace Account {
    export type Get = { type: "Account:get", payload: { id: string, token: string } }
    export function Get(payload: Get["payload"]): Get {
      return { type: "Account:get", payload }
    }
  }
}


class Server {
  private client?: nats.Client;
  constructor(private readonly container: Container) { }
  public async connect() {
    this.close();
    this.client = await nats.connect({ servers: ['nats://nats:4222'], payload: nats.Payload.JSON, name: "mainframe" });
    await this.client.subscribe("rpc", (...args) => this.rpc(...args), { queue: "rpc" });
  }
  public close() {
    if (!this.client) return;
    this.client.close();
    this.client = undefined;
  }
  private async rpc(err: nats.NatsError | null, msg: nats.Msg) {
    if (err) return this.container.log.error(`rpc. ${err.name} ${err.message} ${err.chainedError?.stack}`);
    const req: Message = msg.data;
    let res: Message = Message.Failure.Unexpected;
    try {
      switch (req.type) {
        case "Token:create": {
          res = Message.Token.Create.is(req) ? Message.Token(await this.container.account.signin(req.payload)) : Message.Failure.Invalid;
          break;
        }
        case "Token:delete": {
          res = Message.Token.Delete.is(req) ? Message.Token(await this.container.account.signout(req.payload.token)) : Message.Failure.Invalid;
          break;
        }
        case "Token:get": {
          res = Message.Token.Get.is(req) ? Message.Token(await this.container.account.authorize(req.payload.token)) : Message.Failure.Invalid;
          break;
        }
      }
    } catch (e) {
      if (e instanceof Account.Error) {
        res = Message.Failure(e.message)
      } else {
        this.container.log.error(e, e.stack)
        res = Message.Failure.Internal;
      }
    }
    if (msg.reply) {
      this.client?.publish(msg.reply, res);
    }
  }
}

export default Server