
export type Message = (
  | Message.Signin
  | Message.Session
  | Message.Logout
  | Message.Account.Character.New
  | Message.Account.Character.List
)

export namespace Message {
  export function stringify(m: Message) {
    return JSON.stringify(m)
  }
  export function parse(m: string): Message {
    return JSON.parse(m)
  }
  export type Signin = (
    | Signin.Facebook
    | Signin.Password
  )
  export namespace Signin {
    export interface Facebook {
      type: 'signin.facebook',
      token: string
    }
    export interface Password {
      type: 'signin.password',
      email: string
      password: string
      recaptcha2: string
    }
  }
  export interface Session {
    type: 'session'
    id: string
  }
  export interface Logout {
    type: 'logout'
  }
  export namespace Account {
    export namespace Character {
      export type New = {
        type: 'account.new'
        name: string
        icon?: string
      }
      export type List = {
        type: 'account.list'
      }
    }
  }
}

export default Message;