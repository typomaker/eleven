import pg from "pg";
import * as entity from "../entity";
import Context from "./Context";
import Stash from "./Stash";
type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.Token["id"]]
  | ["=", "isDeleted", entity.Token["isDeleted"]]
  | ["=", "isExpired", entity.Token["isDeleted"]]
  | ["in", "id", Array<entity.Token["id"]>]
);
namespace Filter {
  export function build(st: Filter): string {
    switch (st[0]) {
      case "|": case "&": return st[1].map((e) => `(${Filter.build(e)})`).join({ "|": " OR ", "&": " AND " }[st[0]]);
      case "=": switch (st[1]) {
        case "id": return `id=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "isDeleted": return `deleted IS ${st[2] ? "NOT NULL" : "NULL"}`;
        case "isExpired": return `expired ${st[2] ? "<" : ">="} CURRENT_TIMESTAMP`;
      }
      case "in": switch (st[1]) {
        case "id": return `id IN(${st[2].map(pg.Client.prototype.escapeLiteral).join(",")})`;
      }
    }
  }
}
export class Sign {
  public readonly stash = new Stash<string, entity.Token>();
  constructor(private readonly context: Context) { }
  public async get(ids: entity.Token["id"]): Promise<entity.Token | null>;
  public async get(ids: Array<entity.Token["id"]>): Promise<Map<entity.Token["id"], entity.Token>>;
  public async get(id: Array<entity.Token["id"]> | entity.Token["id"]) {
    if (!Array.isArray(id)) {
      return this.stash.get(id) ?? await this.read(["=", "id", id]).one();
    }
    const notStashed = id.filter((v) => !this.stash.has(v));
    if (notStashed.length)
      await this.read(["in", "id", notStashed]).all();
    return new Map(id.filter(v => this.stash.has(v)).map((v) => [v, this.stash.get(v)!]));
  }
  public read(filter?: Filter) {
    return new class Reader {
      private static build(e: Reader) {
        let query = "SELECT id, created, owner, updated, deleted, expired, ip, sign FROM account.token";
        if (e._filter) query += " WHERE " + Filter.build(e._filter);
        if (e._limit) query += " LIMIT " + Number(e._limit);
        if (e._skip) query += " OFFSET " + Number(e._skip);
        return query;
      }
      private _filter?: Filter = filter;
      private _limit: number | undefined;
      private _skip: number | undefined;
      constructor(private readonly repository: Sign) { }
      public isExpired(v: entity.Token["isExpired"] = true) {
        return this.filter(["=", "isExpired", v]);
      }
      public isDeleted(v: entity.Token["isDeleted"] = true) {
        return this.filter(["=", "isDeleted", v]);
      }
      public id(n: entity.Token["id"] | Array<entity.Token["id"]>) {
        if (Array.isArray(n)) return this.filter(["in", "id", n]);
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
      public async one(): Promise<entity.Token | null> {
        const tokens = await this.limit(1).all();
        return tokens[0] ?? null;
      }
      public async all(): Promise<entity.Token[]> {
        const sql = Reader.build(this);
        return await this.repository.context.connect(async () => {
          const response = await this.repository.context.query(sql);
          return this.repository.make(response.rows);
        })
      }
      private clone() {
        const reader = new Reader(this.repository);
        reader._filter = this._filter;
        reader._skip = this._skip;
        reader._limit = this._limit;
        return reader;
      }
    }(this);
  }
  public async save(tokens: entity.Token | entity.Token[]): Promise<void> {
    if (!Array.isArray(tokens)) tokens = [tokens];
    if (tokens.length === 0) return;
    const sql = `
      INSERT INTO account.token(id, created, owner, updated, ip, sign, deleted, expired)
      VALUES
      (${
      tokens.map((v) => [
        pg.Client.prototype.escapeLiteral(v.id),
        pg.Client.prototype.escapeLiteral(v.created.toISOString()),
        pg.Client.prototype.escapeLiteral(v.owner.id),
        pg.Client.prototype.escapeLiteral(v.updated.toISOString()),
        v.ip ? pg.Client.prototype.escapeLiteral(v.ip) : "NULL",
        v.sign ? pg.Client.prototype.escapeLiteral(v.sign.id) : "NULL",
        v.deleted ? pg.Client.prototype.escapeLiteral(v.deleted.toISOString()) : "NULL",
        v.expired ? pg.Client.prototype.escapeLiteral(v.expired.toISOString()) : "NULL",
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET updated=EXCLUDED.updated, ip=EXCLUDED.ip, sign=EXCLUDED.sign, deleted=EXCLUDED.deleted, expired=EXCLUDED.expired
          WHERE (token.updated, token.ip, token.sign, token.deleted, token.expired)!=(EXCLUDED.updated, EXCLUDED.ip, EXCLUDED.sign, EXCLUDED.deleted, EXCLUDED.expired)
    `;
    await this.context.query(sql)
  }

  public async delete(tokens: entity.Token | entity.Token[]): Promise<void> {
    if (!Array.isArray(tokens)) tokens = [tokens];
    tokens = tokens.filter(token => !token.isDeleted);
    if (tokens.length === 0) return;
    const now = new Date();
    const sql = `UPDATE account.token SET deleted=${pg.Client.prototype.escapeLiteral(now.toISOString())} WHERE id IN(${tokens.map(token => pg.Client.prototype.escapeLiteral(token.id)).join(",")})`;
    await this.context.query(sql)
    tokens.forEach(token => token.deleted = now);
  }
  private async make(rows: any[]): Promise<entity.Token[]> {
    const owners = await this.context.account.get(rows.map((row) => row.owner));
    const signs = await this.context.sign.get(rows.map((row) => row.sign).filter(Boolean));
    return rows.map((row) => this.stash.get(row.id, () => new entity.Token({
      id: String(row.id),
      created: new Date(row.created),
      ip: row.ip ? String(row.ip) : null,
      sign: row.sign ? signs.get(row.sign)! : null,
      owner: owners.get(row.owner)!,
      deleted: row.deleted ? new Date(row.deleted) : null,
      expired: row.expired ? new Date(row.expired) : null,
    })));
  }
}
export default Sign;
