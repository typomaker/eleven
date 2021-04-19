import { Collection, Db } from "mongodb";
import * as game from "../.";
import * as mongo from "../../mongo";
export class Entity extends mongo.Repository<game.Entity> {
  public get db(): Db {
    return this.client.db("game");
  }
  public get collection(): Collection {
    return this.db.collection("entity");
  }

  public find(): Entity.Finder {
    return new Entity.Finder(this)
  }
}

export namespace Entity {
  export class Finder extends mongo.Finder<game.Entity> {
    public id(v: game.Entity["id"]) {
      return this.and(["id", "=", v])
    }
  }
}

export default Entity;