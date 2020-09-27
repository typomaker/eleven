import React from "react";

abstract class Http {
  private headers = new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json;charset=utf-8' })

  #value: Http.Value;
  constructor(value: Http.Value) {
    this.#value = value;
    if (this.#value.token) this.headers.set("Authorization", this.#value.token)
  }

  protected async result<T = any>(r: Response): Promise<T> {
    if (r.ok) return await r.json()
    throw new Http.Error(r.statusText, r.status)
  }

  public abstract setValue(value: Http.Value): void;

  public readonly session = new class Session {
    constructor(private readonly Http: Http) { }

    public async create(request: Http.Session.Create.Request): Promise<Http.Session.Create.Response> {
      const result = await fetch(`${this.Http.#value.host}/session`, {
        method: "POST",
        headers: this.Http.headers,
        body: JSON.stringify(request)
      })
      return await this.Http.result(result);
    }

    public async delete(): Promise<Http.Session.Delete.Response> {
      const result = await fetch(`${this.Http.#value.host}/session`, {
        method: "DELETE",
        headers: this.Http.headers
      });
      return await this.Http.result(result);
    }

  }(this)
}
namespace Http {
  export class Error extends globalThis.Error {
    constructor(
      public readonly message: string,
      public readonly status?: number
    ) {
      super(message)
    }
  }

  export type Value = {
    host?: string
    token?: string
  };

  export type Session = Readonly<{
    id: string
    expired?: string
    user: Readonly<{ id: string, name: string, avatar?: string }>
  }>
  export namespace Session {
    export type Resource = "session"
  }
  export namespace Session.Create {
    export type Request = Readonly<(
      | { type: "facebook", token: string }
      | { type: "password", password: string, recaptcha2: string, email: string }
    )>
    export type Response = Session
  }
  export namespace Session.Delete {
    export type Request = string | null
    export type Response = Session;
  }

  export const Context = React.createContext<Http>(undefined as any as Http);
  Context.displayName = "Http";

  export const Consumer = Context.Consumer;

  export const Provider: React.FunctionComponent<{ value: Value }> = (props) => {
    const [value, setValue] = React.useState<Value>(props.value)
    return (
      <Context.Provider value={new class extends Http { public setValue = setValue }(value)}>
        {props.children}
      </Context.Provider>
    )
  }
}

export default Http;

