import * as mongo from "../../mongo";
import * as entity from "../entity";

export class Session extends mongo.Repository<entity.Session> {
  public get db() { return this.client.db("account") }
  public get collection() { return this.db.collection("session") }
  public find(): Session.Finder {
    return new Session.Finder(this)
  }
}
export namespace Session {
  export class Finder extends mongo.Finder<entity.Session> {
    public uuid(v: entity.Session["uuid"]) {
      return this.and(["uuid", "=", v])
    }
  }
}

export default Session