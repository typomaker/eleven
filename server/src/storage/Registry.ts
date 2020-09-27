import pg from "pg";
import Context from "./Context";

class Registry {
  constructor(public readonly pg: pg.Pool) { }
  public get context() {
    return new Context(this.pg);
  }
  public get account() {
    return this.context.account;
  }
}

export default Registry;
