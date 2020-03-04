import React from "react"
import Configuration from "./Configuration";
type Message = (
  | Message.Error
  | Message.Signin
  | Message.Session
  | Message.Session.Account
)

namespace Message {
  export type Error = {
    type: "error",
    payload: { text: string }
  }
  export type Signin = {
    type: "signin",
    payload: (
      | { type: "facebook", value: string }
      | { type: "password", value: string, email: string, recaptcha2: string }
    )
  }
  export type Session = {
    type: "session",
    payload: { id: string }
  }
  export namespace Session {
    export type Account = {
      type: "session.account",
      payload: { id: string, name: string, avatar: string }
    }
  }
}
type Subscriber = (msg: Message) => void
class WSocket {
  private ws = this.connect()
  private readonly subscribers = new Set<Subscriber>();
  constructor(public readonly host: string) { }
  private connect(): WebSocket {
    const ws = new WebSocket(`server.${this.host}`)
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
      console.log('[WSocket] disconnected: ', e)
      // this.ws = this.connect();
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
  public send(message: Message) {
    this.ws.send(JSON.stringify(message))
  }
}
namespace WSocket {
  const Context = React.createContext<WSocket | null>(null);
  Context.displayName = "WSocket";
  export const Consumer = Context.Consumer;
  export const Provider = Configuration.wrap(
    class Provider extends React.Component<{ configuration: Configuration }> {
      render() {
        return (
          <Context.Provider value={new WSocket(this.props.configuration.domain)}>
            {this.props.children}
          </Context.Provider>
        )
      }
    }
  )
  export function wrap<P extends object>(Component: React.ComponentType<P>): React.FC<Omit<P, "wsocket">> {
    return (props) => (
      <Consumer>
        {(value) => <Component {...props as P} wsocket={value} />}
      </Consumer>
    );
  }
}
export default WSocket;