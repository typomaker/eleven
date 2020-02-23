import * as nats from "ts-nats";
import validator from "validator";
import * as entity from "../entity";
import Account from "./Account";
import Container from "./Container";

type Message = (
  | Message.Failure
  | Message.Success
  | Message.Signin
  | Message.Signout
  | Message.Authorize
  | Message.Token
  | Message.Account
  | Message.Account.GET
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

  export type Signin = { type: "Signin", payload: { type: "password" | "facebook", data: string, email: string } }
  export function Signin(payload: Signin["payload"]): Signin {
    return { type: "Signin", payload }
  }

  export namespace Signin {
    export function is(target: any): target is Signin {
      return (
        target?.type === "Signin"
        && validator.isIn(target?.payload?.type ?? "", ["password", "facebook",])
        && !validator.isEmpty(target?.payload?.data ?? "")
        && validator.isEmail(target?.payload?.email ?? "")
      )
    }
  }

  export type Signout = { type: "Signout", payload: { token: string } }
  export function Signout(payload: Signout["payload"]): Signout {
    return { type: "Signout", payload }
  }

  export namespace Signout {
    export function is(target: Signout | any): target is Signout {
      return !validator.isEmpty(target?.token)
    }
  }
  export type Authorize = { type: "Authorize", payload: { token: string } }
  export function Authorize(payload: Authorize["payload"]): Authorize {
    return { type: "Authorize", payload }
  }
  export namespace Authorize {
    export function is(target: Authorize | any): target is Authorize {
      return !validator.isEmpty(target?.token)
    }
  }

  export type Token = { type: "Token", payload: { id: string, expired?: Date } }
  export const Token = (token: entity.Token): Token => {
    return { type: "Token", payload: { id: token.id, expired: token.expired ?? undefined } }
  }

  export type Account = { type: "Account", payload: Pick<entity.Account, "id" | "avatar" | "name"> }
  export function Account(account: entity.Account): Account {
    return { type: "Account", payload: { id: account.id, avatar: account.avatar, name: account.name } }
  }

  export namespace Account {
    export type GET = { type: "Account.GET", payload: { id: string, token: string } }
    export const GET = (payload: GET["payload"]): GET => {
      return { type: "Account.GET", payload }
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
        case "Signin": {
          res = Message.Signin.is(req) ? Message.Token(await this.container.account.signin(req.payload)) : Message.Failure.Invalid;
          break;
        }
        case "Signout": {
          res = Message.Signout.is(req) ? Message.Token(await this.container.account.signout(req.payload.token)) : Message.Failure.Invalid;
          break;
        }
        case "Authorize": {
          res = Message.Authorize.is(req) ? Message.Token(await this.container.account.authorize(req.payload.token)) : Message.Failure.Invalid;
          break;
        }
      }
    } catch (e) {
      if (e instanceof Account.Error) {
        res = Message.Failure(e.message)
      } else {
        this.container.log.error(e)
        res = Message.Failure.Internal;
      }
    }
    if (msg.reply) {
      this.client?.publish(msg.reply, res);
    }
  }
}

export default Server