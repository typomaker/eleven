import pg from "pg";
import Recaptcha2 from "recaptcha2";
import Storage from "../storage";
import Account from "./Account";
import Logger from "./Logger";
import Password from "./Password";
import WSocket from "./WSocket";
class Container {
  constructor(private readonly config: Container.Configuration) { }

  #log?: Logger
  public get log() {
    if (this.#log) return this.#log;
    return this.#log = new Logger();
  }
  #password?: Password;
  public get password() {
    if (this.#password) return this.#password;
    return this.#password = new Password(this.config.password)
  }
  #pg?: pg.Pool;
  public get pg() {
    if (this.#pg) return this.#pg;
    return this.#pg = new pg.Pool(this.config.pg)
      .on("error", (err) => this.log.error("Unexpected error on idle client", err));
  }
  #storage?: Storage;
  public get storage() {
    if (this.#storage) return this.#storage;
    return this.#storage = new Storage(this.pg);
  }
  #account?: Account;
  public get account() {
    if (this.#account) return this.#account;
    return this.#account = new Account(this);
  }
  #recaptcha2?: Recaptcha2;
  public get recaptcha2() {
    if (this.#recaptcha2) return this.#recaptcha2;
    return this.#recaptcha2 = new Recaptcha2(this.config.recaptcha2);
  }
  #wsocket?: WSocket
  public get wsocket() {
    if (this.#wsocket) return this.#wsocket;
    return this.#wsocket = new WSocket(this);
  }
}
namespace Container {
  export type Configuration = {
    password: Password.Configuration,
    pg: pg.PoolConfig;
    recaptcha2: Recaptcha2.Options;
  }
}
export default Container;