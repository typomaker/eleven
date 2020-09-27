export type Message = (
  | {
    t: "signin:facebook"
    token: string
  }
  | {
    t: "signin:password"
    password: string
    recaptcha2: string
    email: string
  }
  | {
    t: "signout",
  }
  | {
    t: "session",
    id: string
  }
)

export default Message;