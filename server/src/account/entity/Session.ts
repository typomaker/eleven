import User from "./User";

export interface Session {
  id: string;
  user: User;
  created: Date;
  expired: Date;
}
export default Session;