import WebSocket from "ws";
import * as entity from "../entity";
import Container from "./Container";

export type Message = (
  | Message.Error
  | Message.Signin
  | Message.Session
  | Message.Session.Account
)

export namespace Message {
  export type Error = {
    type: "error",
    payload: { text: string }
  }
  export type Signin = {
    type: "signin",
    payload: (
      | { type: "facebook", token: string }
      | { type: "password", password: string, email: string, recaptcha2: string }
    )
  }
  export type Session = {
    type: "session",
    payload: { id: string }
  }
  export namespace Session {
    export type Account = {
      type: "session.account",
      payload: { id: string, name: string, avatar: string | null }
    }
  }
}


class WSocket {
  private session = new Map<string, { ws: WebSocket, account: entity.Account }>();
  private server?: WebSocket.Server;
  constructor(private readonly container: Container) { }
  public async start() {
    this.stop();
    this.server = new WebSocket.Server({ port: 80 });
    this.server.on("connection", (ws, req) => {
      let account: entity.Account | null = null;
      ws.on("open", () => {
        console.log("[WSocket] open")
      })
      ws.on("close", (code: number, reason: string) => {
        console.log("[WSocket] close", code, reason)
        if (account) this.session.delete(account.id)
      })
      ws.on("error", (err) => {
        console.log("[WSocket] error", err)
      })
      ws.on("message", async (data: WebSocket.Data) => {
        console.log("[WSocket] message", data)
        const message: Message = JSON.parse(data.toString())
        switch (message.type) {
          case "signin": {
            try {
              const token = await this.container.account.signin({ ...message.payload, ...{ ip: req.connection.remoteAddress } })
              account = token.owner;
              this.session.set(token.owner.id, { ws, account })

              ws.send(JSON.stringify({ type: "session", payload: { id: token.id } } as Message))
              ws.send(JSON.stringify({ type: "session.account", payload: { id: token.owner.id, name: token.owner.name, avatar: token.owner.avatar } } as Message))
            } catch (e) {
              ws.send(JSON.stringify({ type: "error", payload: { text: e.message } } as Message))
            }
            break;
          }
        }
      })
    })
  }
  public stop() {
    if (!this.server) return;
    this.server.close();
    this.server = undefined;
  }
}

export default WSocket