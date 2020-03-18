import pg from "pg";
import * as entity from "../../entity";
import Context from "../Context";
import Stash from "../Stash";
type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.account.Sign["id"]]
  | ["=", "type", entity.account.Sign["type"]]
  | ["=", "data", entity.account.Sign["data"]]
  | ["=", "owner", entity.account.Sign["owner"]["id"]]
  | ["in", "id", Array<entity.account.Sign["id"]>]
);
namespace Filter {
  export function build(st: Filter): string {
    switch (st[0]) {
      case "|": case "&": return st[1].map(e => `(${Filter.build(e)})`).join({ "|": " OR ", "&": " AND " }[st[0]]);
      case "=": switch (st[1]) {
        case "id": return `id=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "type": return `type=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "data": return `data=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "owner": return `owner=${pg.Client.prototype.escapeLiteral(st[2])}`;
      }
      case "in": switch (st[1]) {
        case "id": return `id IN(${st[2].map(pg.Client.prototype.escapeLiteral).join(",")})`;
      }
    }
  }
}
export class Sign {
  public readonly stash = new Stash<string, entity.account.Sign>();
  constructor(private readonly context: Context) { }

  private async make(rows: any[]): Promise<entity.account.Sign[]> {
    const owners = await this.context.account.user.get(rows.map(row => row.owner));
    return rows.map((row) => this.stash.get(row.id, () => new entity.account.Sign({
      id: String(row.id),
      created: new Date(row.created),
      type: row.type,
      data: String(row.data),
      owner: owners.get(row.owner)!,
    })));
  }
  public async get(ids: entity.account.Sign["id"]): Promise<entity.account.Sign | null>;
  public async get(ids: Array<entity.account.Sign["id"]>): Promise<Map<entity.account.Sign["id"], entity.account.Sign>>;
  public async get(id: Array<entity.account.Sign["id"]> | entity.account.Sign["id"]) {
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
      constructor(private readonly repository: Sign) { }
      public type(n: entity.account.Sign["type"]) {
        return this.filter(["=", "type", n]);
      }
      public owner(n: entity.account.User) {
        return this.filter(["=", "owner", n.id]);
      }
      public data(n: entity.account.Sign["data"]) {
        return this.filter(["=", "data", n]);
      }
      public id(n: entity.account.Sign["id"] | Array<entity.account.Sign["id"]>) {
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
        let query = "SELECT id, type, data, created, owner FROM account.sign";
        if (e.#filter) query += " WHERE " + Filter.build(e.#filter);
        if (e.#limit) query += " LIMIT " + Number(e.#limit);
        if (e.#skip) query += " OFFSET " + Number(e.#skip);
        return query;
      }
      public async one(): Promise<entity.account.Sign | null> {
        const accounts = await this.limit(1).all();
        return accounts[0] ?? null;
      }
      public async all(): Promise<entity.account.Sign[]> {
        const sql = Reader.build(this);
        return await this.repository.context.db.connect(async () => {
          const response = await this.repository.context.db.query(sql);
          return this.repository.make(response.rows);
        });
      }
    }(this);
  }

  public async save(signs: entity.account.Sign | entity.account.Sign[]): Promise<void> {
    if (!Array.isArray(signs)) {
      signs = [signs];
    }
    if (signs.length === 0) return;
    const sql = `
      INSERT INTO account.sign(id, type, data, created, owner)
      VALUES
      (${
      signs.map(v => [
        pg.Client.prototype.escapeLiteral(v.id),
        pg.Client.prototype.escapeLiteral(v.type),
        pg.Client.prototype.escapeLiteral(v.data),
        pg.Client.prototype.escapeLiteral(v.created.toISOString()),
        pg.Client.prototype.escapeLiteral(v.owner.id),
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET data=EXCLUDED.data
          WHERE (sign.data)!=(EXCLUDED.data)
    `;
    await this.context.db.query(sql);
  }
}
export default Sign;
