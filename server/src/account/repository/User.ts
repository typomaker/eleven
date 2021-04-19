import * as mongo from "../../mongo";
import * as entity from "../entity";

export class User extends mongo.Repository<entity.User> {
  public get db() { return this.client.db("account") }
  public get collection() { return this.db.collection("user") }

  public find(): User.Finder {
    return new User.Finder(this)
  }
}
export namespace User {
  export class Finder extends mongo.Finder<entity.User> {
    public uuid(value: string) {
      return this.and(["uuid", "=", value]);
    }
    public sign(sign: entity.User.Sign) {
      return this.and(["sign", "match", [["type", "=", sign.type], "&", ["data", "=", sign.data]]])
    }
  }
}

export default User;