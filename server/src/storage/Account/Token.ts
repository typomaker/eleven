import * as entity from "../../entity";
import Context from "../Context";

interface Raw {
  id: string;
  user: string;
  ip: string;
  sign: string | null;
  created: Date;
  expired: Date | null;
  deleted: Date | null;
}
export class Token {
  constructor(private readonly ctx: Context) { }

  public readonly finder = new class Finder {
    constructor(private readonly repo: Token) { }
    public id(n: entity.account.Token["id"] | entity.account.Token["id"][]): Finder {
      if (Array.isArray(n)) return this.filter(["in", "id", n]);
      return this.filter(["=", "id", n]);
    }

    #limit: number | undefined;
    public limit(n?: number): Finder {
      const reader = this.clone();
      reader.#limit = n;
      return reader;
    }

    #skip: number | undefined;
    public skip(n?: number): Finder {
      const reader = this.clone();
      reader.#skip = n;
      return reader;
    }

    #filter?: Token.Filter;
    public filter(n?: Token.Filter): Finder {
      const reader = this.clone();
      reader.#filter = n && this.#filter ? ["&", [this.#filter, n]] : n;
      return reader;
    }

    private clone() {
      const reader = new Finder(this.repo);
      reader.#filter = this.#filter;
      reader.#skip = this.#skip;
      reader.#limit = this.#limit;
      return reader;
    }

    public build() {
      let query = "SELECT * FROM account.token";
      if (this.#filter) query += " WHERE " + this.buildFilter(this.#filter);
      if (this.#limit) query += " LIMIT " + Number(this.#limit);
      if (this.#skip) query += " OFFSET " + Number(this.#skip);
      return query;
    }

    public async one(): Promise<entity.account.Token | null> {
      const items = await this.limit(1).all();
      return items[0] ?? null;
    }

    public async all(): Promise<entity.account.Token[]> {
      const sql = this.build();
      const response = await this.repo.ctx.db.query<Raw>(sql);
      const users = await this.repo.ctx.account.user.finder.filter(["in", "id", response.rows.map((row) => row.user)]).assoc()
      const tokens: entity.account.Token[] = [];
      for (const raw of response.rows) {
        tokens.push(new entity.account.Token({
          id: raw.id,
          user: users.get(raw.user)!,
          ip: raw.ip,
          sign: raw.sign ? users.get(raw.user)!.signs.find((sign) => sign.id === raw.sign) : null,
          created: raw.created,
          expired: raw.expired,
          deleted: raw.deleted,
        }))
      }

      return tokens;
    }

    private buildFilter(n: Token.Filter): string {
      switch (n[0]) {
        case "|": case "&": return "(" + n[1].map(this.buildFilter.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
        case "=": switch (n[1]) {
          case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
          case "isDeleted": return `deleted IS ${n[2] ? "NOT NULL" : "NULL"}`;
          case "isExpired": return `expired ${n[2] ? "<" : ">="} CURRENT_TIMESTAMP`;
        }
        case "in": switch (n[1]) {
          case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
        }
      }
    }
  }(this);

  public async delete(tokens: entity.account.Token | entity.account.Token[]): Promise<void> {
    if (!Array.isArray(tokens)) {
      tokens = [tokens];
    }
    for (const token of tokens) {
      token.deleted = new Date();
    }
    return this.save(tokens);
  }

  public async save(tokens: entity.account.Token | entity.account.Token[]): Promise<void> {
    if (!Array.isArray(tokens)) {
      tokens = [tokens];
    }
    if (tokens.length === 0) return;
    const sql = `
      INSERT INTO account.token(id, created, "user", ip, sign, deleted, expired)
      VALUES
      (${
      tokens.map((v) => [
        this.ctx.db.literal(v.id),
        this.ctx.db.literal(v.created.toISOString()),
        this.ctx.db.literal(v.user.id),
        v.ip ? this.ctx.db.literal(v.ip) : "NULL",
        v.sign ? this.ctx.db.literal(v.sign.id) : "NULL",
        v.deleted ? this.ctx.db.literal(v.deleted.toISOString()) : "NULL",
        v.expired ? this.ctx.db.literal(v.expired.toISOString()) : "NULL",
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET ip=EXCLUDED.ip, sign=EXCLUDED.sign, deleted=EXCLUDED.deleted, expired=EXCLUDED.expired
          WHERE ( token.ip, token.sign, token.deleted, token.expired)!=(EXCLUDED.ip, EXCLUDED.sign, EXCLUDED.deleted, EXCLUDED.expired)
    `;
    await this.ctx.db.query(sql);
  }
}
export namespace Token {
  export type Filter = (
    | readonly ["&" | "|", Filter[]]
    | readonly ["=", "id", entity.account.Token["id"]]
    | readonly ["=", "isDeleted", entity.account.Token["isDeleted"]]
    | readonly ["=", "isExpired", entity.account.Token["isDeleted"]]
    | readonly ["in", "id", entity.account.Token["id"][]]
  );
}
export default Token;
