import * as account from "../../account";
import User from "./User";

export type Session = {
  id: string
  expired?: string
  user: User
}
export namespace Session {
  export function create(token: account.Token): Session {
    return {
      id: token.id,
      expired: token.expired?.toISOString() ?? undefined,
      user: {
        id: token.user.id,
        name: token.user.name,
        avatar: token.user.avatar ?? undefined,
      }
    }
  }
}

export default Session;