import * as account from "../../account";
export type Session = {
  id: string
}
export namespace Session {
  export function create(entity: account.entity.Session): Session {
    return {
      id: entity.id
    }
  }
}
export default Session;