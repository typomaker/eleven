import pg from "pg";
import * as account from "./account";
import DB from "./DB";
import * as equipment from "./equipment";

class Context {
  constructor(private readonly pool: pg.Pool) { }

  public readonly db = new DB(this.pool);

  public readonly account = new class {
    constructor(private readonly ctx: Context) { }
    public readonly user = new account.User(this.ctx);
    // public readonly email = new account.Email(this.ctx);
    // public readonly sign = new account.Sign(this.ctx);
    public readonly token = new account.Token(this.ctx);
  }(this);

  public readonly equipment = new class {
    constructor(private readonly ctx: Context) { }
    public readonly card = new equipment.Card(this.ctx);
    public readonly trait = new equipment.Trait(this.ctx);
  }(this);
}

export default Context;
