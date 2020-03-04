import url from "url";
import WebSocket from "ws";
import * as entity from "../entity";
import Container from "./Container";

class WSocket {
  private sessions = new Map<entity.Account["id"], { token: entity.Token, ws: WebSocket }>();
  private server?: WebSocket.Server;
  constructor(private readonly container: Container) { }

  public async start() {
    this.stop();
    this.server = new WebSocket.Server({ port: 80 });

    this.server.on("connection", async (ws, req) => {
      let token: entity.Token | undefined;
      const login = (t: entity.Token | null) => {
        console.log("[WSocket] login ", t);
        if (!t) return undefined;
        this.sessions.set(t.owner.id, { ws, token: t });
        ws.send(WSocket.Message.stringify({ type: "token", payload: { id: t.id } }));
        ws.send(WSocket.Message.stringify({ type: "token.account", payload: { id: t.owner.id, name: t.owner.name, avatar: t.owner.avatar } }));
        return t;
      };
      const logout = (t: entity.Token | undefined) => {
        console.log("[WSocket] logout ", t);
        if (!t) return undefined;
        this.sessions.delete(t.owner.id);
        this.container.storage.token.delete(t);
        return t;
      };
      const query: { token?: string } = url.parse(req.url ?? "", true)?.query ?? {};
      ws.on("open", async () => {
        console.log("[WSocket] open");
        if (query.token) {
          token = login(await this.container.storage.token.get(query.token));
        }
      });
      ws.on("close", async (code: number, reason: string) => {
        console.log("[WSocket] close", code, reason);
        token = logout(token);
      });
      ws.on("error", (err) => {
        console.log("[WSocket] error", err);
      });
      ws.on("message", async (data: WebSocket.Data) => {
        console.log("[WSocket] message", data);
        const message: WSocket.Message = JSON.parse(data.toString());
        switch (message.type) {
          case "signin": {
            try {
              token = login(await this.container.account.signin({ ...message.payload, ...{ ip: req.connection.remoteAddress } }));
            } catch (e) {
              ws.send(WSocket.Message.stringify({ type: "error", payload: { text: e.message } }));
            }
            break;
          }
        }
      });
    });
  }
  public stop() {
    if (!this.server) return;
    this.server.close();
    this.server = undefined;
  }
}
namespace WSocket {
  export type Message = (
    | Message.Error
    | Message.Signin
    | Message.Token
    | Message.Token.Account
  );

  export namespace Message {
    export function stringify(msg: Message): string {
      return JSON.stringify(msg);
    }
    export interface Error {
      type: "error";
      payload: { text: string };
    }
    export interface Signin {
      type: "signin";
      payload: (
        | { type: "facebook", token: string }
        | { type: "password", password: string, email: string, recaptcha2: string }
      );
    }
    export interface Token {
      type: "token";
      payload: { id: string };
    }
    export namespace Token {
      export interface Account {
        type: "token.account";
        payload: { id: string, name: string, avatar: string | null };
      }
    }
  }
}

export default WSocket;
