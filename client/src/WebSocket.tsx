import React from "react"
import Configuration from "./Configuration";
import Session from "./Session";
import Game from './Game';

export namespace WebSocket {
  export const Context = React.createContext<globalThis.WebSocket | undefined>(undefined);
  Context.displayName = "WebSocket";
  export const useContext = () => React.useContext(Context);
  export const Consumer = Context.Consumer;
  export const Provider: React.FunctionComponent = ({ children }) => {
    const configuration = React.useContext(Configuration.Context);
    const [session, sessionDispatch] = Session.useContext();
    const [ws, setWs] = React.useState<globalThis.WebSocket | undefined>()
    React.useEffect(() => {
      if (!session.id) return;
      const url = `${configuration.ws}/game?token=${session.id}`;
      const ws = (function connect() {
        console.debug(`[${Context.displayName}][${session.id}] connect`);
        const ws = new globalThis.WebSocket(url);
        ws.onopen = function (e) {
          console.debug(`[${Context.displayName}][${session.id}] connected`)
        }
        ws.onclose = function (e) {
          if (e.code === 1000) {
            console.debug(`[${Context.displayName}][${session.id}] disconnected normal`)
            return;
          }
          console.debug(`[${Context.displayName}][${session.id}] disconnected with code: `, e.code, ', reason: ', e.reason);
          switch (e.code) {
            case 4001: return sessionDispatch({ 'type': 'signout' })
          }
          switch (this.readyState) {
            case globalThis.WebSocket.CLOSED: case globalThis.WebSocket.CLOSING: return setTimeout(() => connect(), 5000)
          }
        }
        ws.onerror = function (e) {
          console.error(`[${Context.displayName}][${session.id}] error: `, e);
          this.close();
          setWs(undefined);
        }
        setWs(ws);
        return ws;
      })()
      return () => {
        console.debug(`[${Context.displayName}][${session.id}] disconnect `)
        ws.close()
        setWs(undefined)
      }
    }, [session.id, configuration.ws])
    return (
      <Context.Provider value={ws}>
        {children}
      </Context.Provider>
    )
  }
  export const useListener = function (cb: (msg: Action) => void) {
    const ws = useContext();
    React.useEffect(() => {
      if (!ws) return;
      const listener = (msg: MessageEvent) => cb(JSON.parse(msg.data));
      ws.addEventListener('message', listener)
      return () => ws.removeEventListener('message', listener)
    }, [ws]);
  }

  export const useSender = function () {
    const ws = useContext();
    return (msg: Action) => {
      if (!ws) return;
      const data = JSON.stringify(msg);
      if (ws.readyState === globalThis.WebSocket.OPEN) ws.send(data)
      else if (ws.readyState === globalThis.WebSocket.CONNECTING) setTimeout(() => ws.send(data), 1000)
    }
  }

  export type Action = (
    | Action.Entity
    | Action.State
  );
  export namespace Action {
    export type Entity = {
      type: 'entity',
      entity: Partial<Game.Entity>
    }
    export type State = {
      type: 'state'
      state: Game.State
    }
  }
}
export default WebSocket;