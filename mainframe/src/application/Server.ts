import nats from "ts-nats";
import * as entity from "../entity";
import Account from "./Account";
import Container from "./Container";


type Response = (
  | Response.Success
  | Response.Fail
  | Response.Token
)

namespace Response {
  type Body<K extends boolean, T> = {
    ok: K
    payload?: T
  }
  export type Success = Body<true, never>
  export const Success = (): Success => ({ ok: true })
  export type Fail = Body<false, string | undefined>
  export function Fail(payload?: string): Fail {
    return { ok: false, payload }
  }
  export namespace Fail {
    export const Invalid = Fail("Invalid");
    export const Internal = Fail("Internal");
  }
  export type Token = Body<true, { id: string, expired?: string, sign?: string, owner: string }>
  export const Token = (data: entity.Token): Token => ({
    ok: true,
    payload: {
      id: data.id,
      owner: data.owner.id,
      expired: data.expired?.toISOString(),
      sign: data.sign?.id
    }
  })
}


class Server {
  private client?: nats.Client;
  constructor(private readonly container: Container) { }
  public async connect() {
    this.close();

    this.client = await nats.connect({ servers: ['nats://nats:4222'], payload: nats.Payload.JSON, name: "mainframe" });
    {
      const queue = "rpc";
      await this.client.subscribe('signin', (...args) => this.signin(...args), { queue });
      await this.client.subscribe('signout', (...args) => this.signout(...args), { queue });
      await this.client.subscribe('authorize', (...args) => this.authorize(...args), { queue });
    }
  }
  public close() {
    if (!this.client) return;
    this.client.close();
    this.client = undefined;
  }
  private checkError(err: nats.NatsError | null) {
    if (!err) return false;
    this.container.log.error(`${err.name} ${err.message} ${err.chainedError?.stack}`);
    return true;
  }
  private respond(subject: string | undefined, body: Response): boolean {
    if (subject) {
      this.client?.publish(subject, body);
      return true;
    }
    return false;
  }
  private async signin(err: nats.NatsError | null, msg: nats.Msg) {
    if (this.checkError(err)) return;
    const data = msg.data
    if (!Account.Creadential.is(data)) return this.respond(msg.reply, Response.Fail.Invalid);
    try {
      const token = await this.container.account.signin(data);
      this.respond(msg.reply, Response.Token(token))
    } catch (e) {
      this.container.log.error(e);
      return this.respond(msg.reply, Response.Fail.Internal)
    }
  }
  private async signout(err: nats.NatsError | null, msg: nats.Msg) {
    if (this.checkError(err)) return;
    const data = msg.data
    if (typeof data?.id !== "string") return this.respond(msg.reply, Response.Fail.Invalid);
    try {
      const token = await this.container.account.signout(data.id);
      this.respond(msg.reply, Response.Success())
    } catch (e) {
      this.container.log.error(e);
      return this.respond(msg.reply, Response.Fail.Internal)
    }
  }
  private async authorize(err: nats.NatsError | null, msg: nats.Msg) {
    if (this.checkError(err)) return;
    const data = msg.data
    if (typeof data?.id !== "string") return this.respond(msg.reply, Response.Fail.Invalid);
    try {
      const token = await this.container.account.authorize(data.id);
      this.respond(msg.reply, Response.Token(token))
    } catch (e) {
      this.container.log.error(e);
      return this.respond(msg.reply, Response.Fail.Internal)
    }
  }
}

export default Server