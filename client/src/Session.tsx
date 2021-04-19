import React from "react"
import WebSocket from "./WebSocket";
import store, { namespace } from "store";
import Configuration from "./Configuration";

interface Session {
  uuid: string | null;
  error?: string
}
namespace Session {
  export type Dispatch = (action: Action) => void
  export type Action = (
    | Action.Signin
    | Action.Signout
  );
  export namespace Action {
    export interface Signin {
      type: 'signin',
      payload: (
        | Signin.Facebook
        | Signin.Password
      )
    }
    export namespace Signin {
      export interface Facebook {
        type: 'fb',
        token: string
      }
      export interface Password {
        type: 'pw',
        email: string
        password: string
        recaptcha2: string
      }
    }
    export interface Signout {
      type: 'signout'
    }
  }

  const Context = React.createContext<[Session, React.Dispatch<Action>] | undefined>(undefined);
  Context.displayName = "Session";

  export const useContext = () => {
    const context = React.useContext(Context);
    if (!context) throw new Error('context not defined')
    return context;
  };
  export const Consumer = Context.Consumer;
  export const Provider: React.FunctionComponent = ({ children }) => {
    const configuration = React.useContext(Configuration.Context);
    const [session, setSession] = React.useState<Session>({ uuid: null });
    const dispatch = React.useCallback<Dispatch>(async (action: Action) => {
      switch (action.type) {
        case 'signin': {
          console.debug(`[${Context.displayName}] dispatch ${JSON.stringify(action)}`)
          const response = await fetch(`${configuration.http}/sign`, { method: 'POST', body: JSON.stringify(action.payload), headers: { 'Content-Type': 'application/json' } })
          if (response.ok) {
            const json = await response.json();
            setSession({ uuid: json.uuid })
          } else {
            const json = await response.json();
            setSession(prev => ({ ...prev, error: json.message }))
          }
          break;
        }
        case 'signout': {
          const response = await fetch(`${configuration.http}/sign`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': session.uuid! } })
          if (response.ok) {
            setSession({ uuid: null })
          } else {
            const json = await response.json();
            setSession(prev => ({ ...prev, error: json.message }))
          }
          break;
        }
      }
    }, [session])
    const value = React.useMemo<[Session, React.Dispatch<Action>]>(() => [session, dispatch], [session])
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    )
  }
}

export default Session;