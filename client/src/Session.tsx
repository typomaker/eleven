import React, { useState } from "react"
import WSocket from "./WSocket";

type Session = null | {
  id: string,
  expired?: string
}
namespace Session {
  export const Context = React.createContext<Session>(null);
  Context.displayName = "Session";
  export const Consumer = Context.Consumer;
  export const Provider: React.FunctionComponent = ({ children }) => {
    const [value, setValue] = useState<Session>(null);
    WSocket.useMessage((msg: WSocket.Message) => {
      if (msg.type === "session") {
        setValue(msg.payload);
      }
    })
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    )
  }
  type Account = null | {
    id: string
    avatar: string | null
    name: string
  }
  export namespace Account {
    export const Context = React.createContext<Account>(null);
    Context.displayName = "Session.Account";
    export const Consumer = Context.Consumer;
    export const Provider: React.FunctionComponent = ({ children }) => {
      const [value, setValue] = useState<Account>(null);
      WSocket.useMessage((msg: WSocket.Message) => {
        if (msg.type === "session.account") {
          setValue(msg.payload);
        }
      })
      return (
        <Context.Provider value={value}>
          {children}
        </Context.Provider>
      )
    }
  }
}

export default Session;