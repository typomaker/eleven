import React, { useState, useContext } from "react"
import WSocket from "./WSocket";
import store from "store";
import Http from "./Http";

abstract class Session {
  public readonly value: Session.Value

  constructor(private readonly http: Http, value: Session.Value) {
    this.value = { ...store.get("session"), value };
  }
  public async signin(data: Http.Session.Create.Request): Promise<void> {
    const session = await this.http.session.create(data);
    this.setValue({ ...this.value, user: session })
    store.set("session", { ...this.value, user: session });
  }
  public async signout(): Promise<void> {
    await this.http.session.delete()
    this.setValue({ ...this.value, user: undefined })
    store.remove("session");
  }
  public abstract setValue(value: Session.Value): void;
}
namespace Session {
  export type Value = {
    user?: {
      readonly id: string
      readonly expired?: string
      readonly user: {
        readonly id: string
        readonly name: string
        readonly avatar?: string
      }
    }
  }

  export const Context = React.createContext<Session>(undefined as any as Session);
  Context.displayName = "Session";

  export const Consumer = Context.Consumer;

  export const Provider: React.FunctionComponent = ({ children }) => {
    const http = useContext(Http.Context);

    const [value, setValue] = useState<Value>({});

    return (
      <Context.Provider value={new class extends Session { setValue = setValue }(http, value)}>
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