import pg from "pg";
import * as entity from "../../entity";
import Context from "./../Context";
import Stash from "./../Stash";
type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.account.User["id"]]
  | ["in", "id", Array<entity.account.User["id"]>]
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
  public readonly stash = new Stash<string, entity.account.User>();
  constructor(private readonly context: Context) { }

  private make(rows: any[]): entity.account.User[] {
    return rows.map((row) => this.stash.get(row.id, () => new entity.account.User({
      id: String(row.id),
      avatar: row.avatar ? String(row.avatar) : null,
      created: new Date(row.created),
      name: String(row.name),
    })));
  }
  public async get(ids: entity.account.User["id"]): Promise<entity.account.User | null>;
  public async get(ids: Array<entity.account.User["id"]>): Promise<Map<entity.account.User["id"], entity.account.User>>;
  public async get(id: Array<entity.account.User["id"]> | entity.account.User["id"]) {
    if (!id) return new Map();
    if (!Array.isArray(id)) return this.stash.get(id) ?? await this.read(["=", "id", id]).one();
    const notStashed = id.filter(v => !this.stash.has(v));
    if (notStashed.length) await this.read(["in", "id", notStashed]).all();
    return new Map(id.filter(v => this.stash.has(v)).map(v => [v, this.stash.get(v)!]));
  }
  public read(filter?: Filter) {
    return new class Reader {
      #filter?: Filter = filter;
      #limit: number | undefined;
      #skip: number | undefined;
      constructor(private readonly repository: Account) { }
      public id(n: entity.account.User["id"] | Array<entity.account.User["id"]>) {
        if (Array.isArray(n)) return this.filter(["in", "id", n]);
        return this.filter(["=", "id", n]);
      }
      public limit(n?: number): Reader {
        const reader = this.clone();
        reader.#limit = n;
        return reader;
      }
      public skip(n?: number): Reader {
        const reader = this.clone();
        reader.#skip = n;
        return reader;
      }
      public filter(n?: Filter): Reader {
        const reader = this.clone();
        reader.#filter = n && this.#filter ? ["&", [this.#filter, n]] : n;
        return reader;
      }
      private clone() {
        const reader = new Reader(this.repository);
        reader.#filter = this.#filter;
        reader.#skip = this.#skip;
        reader.#limit = this.#limit;
        return reader;
      }
      private static build(e: Reader) {
        let query = "SELECT id, avatar, created, name FROM account.user";
        if (e.#filter) query += " WHERE " + Filter.build(e.#filter);
        if (e.#limit) query += " LIMIT " + Number(e.#limit);
        if (e.#skip) query += " OFFSET " + Number(e.#skip);
        return query;
      }
      public async one(): Promise<entity.account.User | null> {
        const accounts = await this.limit(1).all();
        return accounts[0] ?? null;
      }
      public async all(): Promise<entity.account.User[]> {
        const sql = Reader.build(this);
        return await this.repository.context.db.connect(async () => {
          const response = await this.repository.context.db.query(sql);
          return this.repository.make(response.rows);
        });
      }
    }(this);
  }
  public async save(accounts: entity.account.User | entity.account.User[]): Promise<void> {
    if (!Array.isArray(accounts)) {
      accounts = [accounts];
    }
    if (accounts.length === 0) return;
    const sql = `
      INSERT INTO account.user(id, avatar, created, name)
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
          WHERE (user.name,user.avatar)!=(EXCLUDED.name,EXCLUDED.avatar)
    `;
    await this.context.db.query(sql);
  }
}
export default Account;
