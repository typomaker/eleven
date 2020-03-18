import pg from "pg";
import * as entity from "../../entity";
import Context from "../Context";
import Stash from "../Stash";
type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.account.Email["id"]]
  | ["=", "address", entity.account.Email["address"]]
  | ["=", "confirmed", boolean]
  | ["=", "owner", entity.account.Email["owner"]["id"]]
  | ["in", "id", Array<entity.account.Email["id"]>]
);
namespace Filter {
  export function build(st: Filter): string {
    switch (st[0]) {
      case "|": case "&": return st[1].map(e => `(${Filter.build(e)})`).join({ "|": " OR ", "&": " AND " }[st[0]]);
      case "=": switch (st[1]) {
        case "id": return `id=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "address": return `address=${pg.Client.prototype.escapeLiteral(st[2])}`;
        case "confirmed": return `confirmed IS ${st[2] ? "NOT NULL" : "NULL"}`;
        case "owner": return `owner=${pg.Client.prototype.escapeLiteral(st[2])}`;
      }
      case "in": switch (st[1]) {
        case "id": return `id IN(${st[2].map(pg.Client.prototype.escapeLiteral).join(",")})`;
      }
    }
  }
}
export class Email {
  public readonly stash = new Stash<string, entity.account.Email>();
  constructor(private readonly context: Context) { }

  private async make(rows: any[]): Promise<entity.account.Email[]> {
    const owners = await this.context.account.user.get(rows.map(row => row.owner));
    return rows.map((row) => this.stash.get(row.id, () => new entity.account.Email({
      id: String(row.id),
      created: new Date(row.created),
      address: String(row.address),
      owner: owners.get(row.owner)!,
      confirmed: row.confirmed ? new Date(row.confirmed) : null,
    })));
  }

  public read(filter?: Filter) {
    return new class Reader {
      #filter?: Filter = filter;
      #limit: number | undefined;
      #skip: number | undefined;
      constructor(private readonly repository: Email) { }
      public confirmed(n: boolean = true): Reader {
        return this.filter(["=", "confirmed", n]);
      }
      public id(n: entity.account.Email["id"] | Array<entity.account.Email["id"]>): Reader {
        if (Array.isArray(n)) return this.filter(["in", "id", n]);
        return this.filter(["=", "id", n]);
      }
      public owner(n: entity.account.User) {
        return this.filter(["=", "owner", n.id]);
      }
      public address(n: entity.account.Email["address"]): Reader {
        return this.filter(["=", "address", n]);
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
        let query = "SELECT id, address, created, confirmed, owner FROM account.email";
        if (e.#filter) query += " WHERE " + Filter.build(e.#filter);
        if (e.#limit) query += " LIMIT " + Number(e.#limit);
        if (e.#skip) query += " OFFSET " + Number(e.#skip);
        return query;
      }
      public async one(): Promise<entity.account.Email | null> {
        const accounts = await this.limit(1).all();
        return accounts[0] ?? null;
      }
      public async all(): Promise<entity.account.Email[]> {
        const sql = Reader.build(this);
        return await this.repository.context.db.connect(async () => {
          const response = await this.repository.context.db.query(sql);
          return this.repository.make(response.rows);
        });
      }
    }(this);
  }

  public async save(emails: entity.account.Email | entity.account.Email[]): Promise<void> {
    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    if (emails.length === 0) return;
    const sql = `
      INSERT INTO account.email(id, address, created, confirmed, owner)
      VALUES
      (${
      emails.map(v => [
        pg.Client.prototype.escapeLiteral(v.id),
        pg.Client.prototype.escapeLiteral(v.address),
        pg.Client.prototype.escapeLiteral(v.created.toISOString()),
        v.confirmed ? pg.Client.prototype.escapeLiteral(v.confirmed.toISOString()) : "NULL",
        pg.Client.prototype.escapeLiteral(v.owner.id),
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET confirmed=EXCLUDED.confirmed
          WHERE (email.confirmed)!=(EXCLUDED.confirmed)
    `;
    await this.context.db.query(sql);
  }
}
export default Email;
