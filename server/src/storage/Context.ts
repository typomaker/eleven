import pg from "pg";
import Account from "./Account";
import DB from "./DB";

class Context {
  constructor(private readonly pool: pg.Pool) { }

  #db?: DB;
  public get db() {
    return this.#db ?? (this.#db = new DB(this.pool));
  }
  #account?: Account;
  public get account() {
    return this.#account ?? (this.#account = new Account(this));
  }
}

export default Context;
