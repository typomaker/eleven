import pg from "pg";
import Context from "./Context";

class Registry {
  constructor(public readonly pool: pg.Pool) { }
  public get context() {
    return new Context(this.pool);
  }
  public get account() {
    return this.context.account;
  }
}

export default Registry;
