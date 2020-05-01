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
  public get equipment() {
    return this.context.equipment;
  }
}

export default Registry;
