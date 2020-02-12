import pg from "pg";
import Recaptcha2 from "recaptcha2";
import Storage from "../storage";
import Account from "./Account";
import Logger from "./Logger";
import Password from "./Password";
import Server from "./Server";
class Container {
  constructor(private readonly config: Container.Configuration) { }

  private _log?: Logger
  public get log() {
    if (this._log) return this._log;
    return this._log = new Logger();
  }
  private _password?: Password;
  public get password() {
    if (this._password) return this._password;
    return this._password = new Password(this.config.password)
  }
  private _pg?: pg.Pool;
  public get pg() {
    if (this._pg) return this._pg;
    return this._pg = new pg.Pool(this.config.pg)
      .on("error", (err) => this.log.error("Unexpected error on idle client", err));
  }
  private _storage?: Storage;
  public get storage() {
    if (this._storage) return this._storage;
    return this._storage = new Storage(this.pg);
  }
  private _account?: Account;
  public get account() {
    if (this._account) return this._account;
    return this._account = new Account(this);
  }
  private _recaptcha2?: Recaptcha2;
  public get recaptcha2() {
    if (this._recaptcha2) return this._recaptcha2;
    return this._recaptcha2 = new Recaptcha2(this.config.recaptcha2);
  }
  private _server?: Server
  public get server() {
    if (this._server) return this._server;
    return this._server = new Server(this);
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