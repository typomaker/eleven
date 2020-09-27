import pg from "pg";
import * as account from "./account";
import DB from "./DB";

class Context {
  constructor(private readonly pool: pg.Pool) { }

  public readonly db = new DB(this.pool);

  public readonly account = new class {
    constructor(private readonly ctx: Context) { }
    public readonly user = new account.User(this.ctx);
    public readonly token = new account.Token(this.ctx);
  }(this);
}

export default Context;
