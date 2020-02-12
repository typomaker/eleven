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
  public get email() {
    return this.context.email;
  }
  public get sign() {
    return this.context.sign;
  }
  public get token() {
    return this.context.token;
  }
}

export default Registry;
