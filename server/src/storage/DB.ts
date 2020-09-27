import pg from "pg";

class DB {
  constructor(private readonly pool: pg.Pool) { }

  public async query<T = any>(sql: string): Promise<pg.QueryResult<T>> {
    return await this.connection?.query<T>(sql) ?? this.connect(() => this.query(sql));
  }

  private openned = 0;
  private connection?: pg.PoolClient;
  public async connect<T>(fn: (ctx: DB) => Promise<T>): Promise<T> {
    if (this.openned === 0 && !this.connection) {
      this.connection = await this.pool.connect();
    }

    this.openned++;
    const result = await fn(this);
    this.openned--;

    if (this.openned === 0 && this.connection) {
      this.connection.release();
      this.connection = undefined;
    }
    return result;
  }
  private levelOfTransaction = 0;
  public async transaction<T>(fn: (ctx: DB) => Promise<T>): Promise<T> {
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
      });
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
      });
    }
  }

  public literal(v: string): string {
    return pg.Client.prototype.escapeLiteral(v);
  }
  public identifier(v: string): string {
    return pg.Client.prototype.escapeIdentifier(v);
  }
}

export default DB;
