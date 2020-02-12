import pg from "pg";
import Account from "./Account";
import Email from "./Email";
import Sign from "./Sign";
import Token from "./Token";

class Context {
  constructor(private readonly pool: pg.Pool) { }

  public async query<T = any>(sql: string): Promise<pg.QueryResult<T>> {
    return await this.connection?.query<T>(sql) ?? this.connect(() => this.query(sql));
  }
  private numberOfOpenned = 0;
  private connection?: pg.PoolClient
  public async connect<T>(fn: (ctx: Context) => Promise<T>): Promise<T> {
    if (this.numberOfOpenned === 0 && !this.connection) {
      this.connection = await this.pool.connect()
    }

    this.numberOfOpenned++;
    const result = await fn(this);
    this.numberOfOpenned--;

    if (this.numberOfOpenned === 0 && this.connection) {
      this.connection.release();
      this.connection = undefined;
    }
    return result;
  }
  private levelOfTransaction = 0;
  public async transaction<T>(fn: (ctx: Context) => Promise<T>): Promise<T> {
    if (this.levelOfTransaction) {
      const sp = `tx${this.levelOfTransaction}`;
      return await this.connect(async () => {
        await this.query(`SAVEPOINT ${sp}`);
        try {
          this.levelOfTransaction++;
          const result = await fn(this);
          await this.query(`RELEASE SAVEPOINT ${sp}`);
          return result;
        } catch (e) {
          await this.query(`ROLLBACK TO SAVEPOINT ${sp}`);
          throw e;
        } finally {
          this.levelOfTransaction--;
        }
      })
    } else {
      return await this.connect(async () => {
        await this.query("BEGIN");
        try {
          this.levelOfTransaction = 1;
          const result = await fn(this);
          await this.query("COMMIT");
          return result;
        } catch (e) {
          await this.query("ROLLBACK");
          throw e;
        } finally {
          this.levelOfTransaction = 0;
        }
      })
    }
  }
  private _account?: Account
  public get account() {
    return this._account ?? (this._account = new Account(this))
  }
  private _email?: Email
  public get email() {
    return this._email ?? (this._email = new Email(this))
  }
  private _sign?: Sign
  public get sign() {
    return this._sign ?? (this._sign = new Sign(this))
  }
  private _token?: Token
  public get token() {
    return this._token ?? (this._token = new Token(this))
  }
}

export default Context;