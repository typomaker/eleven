import React, { useContext, useEffect } from "react"
import Configuration from "./Configuration";

type Subscriber = (msg: WSocket.Message) => void
class WSocket {
  private ws = this.connect()
  private readonly subscribers = new Set<Subscriber>();
  constructor(public readonly host: string) { }
  private connect(): WebSocket {
    const ws = new WebSocket(this.host)
    ws.onopen = (e) => {
      console.log('[WSocket] connected: ', e)
    }
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data)
      console.log(message)
      for (const subscriber of this.subscribers) {
        Promise.resolve().then(() => subscriber(message))
      }
    }
    ws.onclose = (e) => {
      if (e.code === 1000) {
        console.log('[WSocket] disconnected normal ')
        return;
      }
      console.log('[WSocket] disconnected with code: ', e.code, ', reason: ', e.reason)
      switch (this.ws.readyState) {
        case WebSocket.CLOSED:
        case WebSocket.CLOSING: {
          setTimeout(() => this.ws = this.connect(), 3000)
          break;
        }
      }
    }
    ws.onerror = (e) => {
      console.error('[WSocket] error: ', e);
      ws.close();
    }
    return ws
  }
  public subscribe(fn: Subscriber) {
    this.subscribers.add(fn)
  }
  public unsubscribe(fn: Subscriber) {
    this.subscribers.delete(fn)
  }
  public async send(message: WSocket.Message) {
    return new Promise((ok, fail) => {
      const text = JSON.stringify(message);
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(text)
        ok();
      } else if (this.ws.readyState === WebSocket.CONNECTING) {
        setTimeout(() => this.send(message), 1000)
      }
    })
  }
}
namespace WSocket {
  export const Context = React.createContext<WSocket>(WSocket.prototype);
  Context.displayName = "WSocket";
  export const Consumer = Context.Consumer;

  export const Provider: React.FunctionComponent = ({ children }) => {
    const configuration = useContext(Configuration.Context);
    return (
      <Context.Provider value={new WSocket(configuration.ws)}>
        {children}
      </Context.Provider>
    )
  }
  export const useMessage = function (cb: (msg: Message) => void) {
    const wsocket = useContext(Context);
    useEffect(() => {
      wsocket.subscribe(cb)
      return () => wsocket.unsubscribe(cb);
    }, [wsocket]);
  }
  export type Message = (
    | Message.Error
    | Message.Signin
    | Message.Token
    | Message.Token.Account
  )

  export namespace Message {
    export type Error = {
      type: "error",
      payload: { text: string }
    }
    export type Signin = {
      type: "signin",
      payload: (
        | { type: "token", id: string }
        | { type: "facebook", token: string }
        | { type: "password", password: string, email: string, recaptcha2: string }
      )
    }
    export type Token = {
      type: "session",
      payload: { id: string, expired?: string }
    }
    export namespace Token {
      export type Account = {
        type: "session.account",
        payload: { id: string, name: string, avatar: string }
      }
    }
  }
}
export default WSocket;