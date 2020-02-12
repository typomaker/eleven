import pg from "pg";
import * as entity from "../entity";
import Context from "./Context";
import Stash from "./Stash";
type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.Account["id"]]
  | ["in", "id", Array<entity.Account["id"]>]
);
namespace Filter {
  export function build(st: Filter): string {
    switch (st[0]) {
      case "|": case "&": return st[1].map(e => `(${Filter.build(e)})`).join({ "|": " OR ", "&": " AND " }[st[0]]);
      case "=": switch (st[1]) {
        case "id": return `id=${pg.Client.prototype.escapeLiteral(st[2])}`;
      }
      case "in": switch (st[1]) {
        case "id": return `id IN(${st[2].map(pg.Client.prototype.escapeLiteral).join(",")})`;
      }
    }
  }
}
export class Account {
  public readonly stash = new Stash<string, entity.Account>();
  constructor(private readonly context: Context) { }

  private make(rows: any[]): entity.Account[] {
    return rows.map((row) => this.stash.get(row.id, () => new entity.Account({
      id: String(row.id),
      avatar: String(row.avatar),
      created: new Date(row.created),
      name: String(row.name)
    })));
  }
  public async get(ids: entity.Account["id"]): Promise<entity.Account | null>;
  public async get(ids: Array<entity.Account["id"]>): Promise<Map<entity.Account["id"], entity.Account>>;
  public async get(id: Array<entity.Account["id"]> | entity.Account["id"]) {
    if (!Array.isArray(id))
      return this.stash.get(id) ?? await this.read(["=", "id", id]).one();
    const notStashed = id.filter(v => !this.stash.has(v));
    if (notStashed.length)
      await this.read(["in", "id", notStashed]);
    return new Map(id.filter(this.stash.has).map(v => [v, this.stash.get(v)!]));
  }
  public read(filter?: Filter) {
    return new class Reader extends Promise<entity.Account[]> {
      private _filter?: Filter = filter;
      private _limit: number | undefined;
      private _skip: number | undefined;
      constructor(private readonly repository: Account) {
        super((ok, fail) => this.all().then(ok, fail));
      }
      public id(n: entity.Account["id"] | Array<entity.Account["id"]>) {
        if (Array.isArray(n))
          return this.filter(["in", "id", n]);
        return this.filter(["=", "id", n]);
      }
      public limit(n?: number): Reader {
        const reader = this.clone();
        reader._limit = n;
        return reader;
      }
      public skip(n?: number): Reader {
        const reader = this.clone();
        reader._skip = n;
        return reader;
      }
      public filter(n?: Filter): Reader {
        const reader = this.clone();
        reader._filter = n && this._filter ? ["&", [this._filter, n]] : n;
        return reader;
      }
      private clone() {
        const reader = new Reader(this.repository);
        reader._filter = this._filter;
        reader._skip = this._skip;
        reader._limit = this._limit;
        return reader;
      }
      private static build(e: Reader) {
        let query = "SELECT id, avatar, created, name FROM account.account";
        if (e._filter) query += " WHERE " + Filter.build(e._filter);
        if (e._limit) query += " LIMIT " + Number(e._limit);
        if (e._skip) query += " OFFSET " + Number(e._skip);
        return query;
      }
      public async one(): Promise<entity.Account | null> {
        const accounts = await this.limit(1).all();
        return accounts[0] ?? null;
      }
      public async all(): Promise<entity.Account[]> {
        const sql = Reader.build(this);
        return this.repository.context.connect(async () => {
          const response = await this.repository.context.query(sql);
          return this.repository.make(response.rows);
        })
      }
    }(this)
  }
  public async save(accounts: entity.Account | entity.Account[]): Promise<void> {
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }
    if (accounts.length === 0) return;
    const sql = `
      INSERT INTO account.account(id, avatar, created, name) 
      VALUES 
      (${
      accounts.map(v => [
        pg.Client.prototype.escapeLiteral(v.id),
        v.avatar ? pg.Client.prototype.escapeLiteral(v.avatar) : "NULL",
        pg.Client.prototype.escapeLiteral(v.created.toISOString()),
        pg.Client.prototype.escapeLiteral(v.name),
      ]).join("),(")
      })
      ON CONFLICT(id) 
        DO UPDATE 
          SET name=EXCLUDED.name, avatar=EXCLUDED.avatar 
          WHERE (account.name,account.avatar)!=(EXCLUDED.name,EXCLUDED.avatar)
    `
    this.context.query(sql);
  }
}
export default Account;