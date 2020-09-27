import * as account from "../../account";
import Context from "../Context";

interface Raw {
  id: string;
  name: string;
  avatar: string | null;
  created: Date;
  deleted: Date | null;
  emails: Raw.Email[];
  signs: Raw.Sign[];
}
namespace Raw {
  export interface Email {
    id: string;
    address: string;
    confirmed: Date | null;
    user: string;
    created: Date;
    deleted: Date | null;
  }
  export interface Sign {
    id: string;
    type: string;
    data: string;
    user: string;
    created: Date;
    deleted: Date | null;
  }
}
export class User {
  constructor(private readonly ctx: Context) { }

  public readonly builder = new class Builder {
    constructor(private readonly repo: User) { }

    public readonly filter = new class {

      constructor(private readonly repo: User) { }

      private sign(n: User.Filter.Sign): string {
        switch (n[0]) {
          case "|": case "&": return "(" + n[1].map(this.sign.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
          case "=": switch (n[1]) {
            case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
            case "type": return `type=${this.repo.ctx.db.literal(n[2])}`;
            case "data": return `data=${this.repo.ctx.db.literal(n[2])}`;
            case "user": return `user=${this.repo.ctx.db.literal(n[2])}`;
            case "deleted": return `deleted IS ${n[2] ? "NOT NULL" : "NULL"}`
          }
          case "in": switch (n[1]) {
            case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
          }
        }
      }

      private email(n: User.Filter.Email): string {
        switch (n[0]) {
          case "|": case "&": return "(" + n[1].map(this.email.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
          case "=": switch (n[1]) {
            case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
            case "address": return `address=${this.repo.ctx.db.literal(n[2])}`;
            case "confirmed": return `confirmed IS ${n[2] ? "NOT NULL" : "NULL"}`;
            case "user": return `user=${this.repo.ctx.db.literal(n[2])}`;
            case "deleted": return `deleted IS ${n[2] ? "NOT NULL" : "NULL"}`
          }
          case "in": switch (n[1]) {
            case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
          }
        }
      }

      public build(n: User.Filter): string {
        switch (n[0]) {
          case "|": case "&": return "(" + n[1].map(this.build.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
          case "=": switch (n[1]) {
            case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
            case "emails": return `id IN(SELECT "user" FROM account.email WHERE ${this.email(n[2])})`;
            case "signs": return `id IN(SELECT "user" FROM account.sign WHERE ${this.sign(n[2])})`;
          }
          case "in": switch (n[1]) {
            case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
          }
        }
      }

    }(this.repo);

    public readonly reader = new class {

      constructor(private readonly repo: User) { }

      public build(n: User.Condition): string {
        let query = `
      SELECT
        *
      FROM
        account."user",
        LATERAL (
          SELECT json_agg(email.*) as emails
          FROM account.email
          WHERE email."user" = "user".id
        ) emails,
        LATERAL (
          SELECT json_agg(sign.*) as signs
          FROM account.sign
          WHERE sign."user" = "user".id
        ) signs
      `;
        if (n.filter) query += " WHERE " + this.repo.builder.filter.build(n.filter);
        if (n.limit) query += " LIMIT " + Number(n.limit);
        if (n.skip) query += " OFFSET " + Number(n.skip);
        return query;
      }

    }(this.repo);

    public readonly writer = new class {

      constructor(private readonly repo: User) { }

      private sign(vs: account.Sign[]): string {
        const values = vs.map((v) => (
          `(
          ${this.repo.ctx.db.literal(v.id)}::uuid,
          ${this.repo.ctx.db.literal(v.type)}::account.sign_type,
          ${this.repo.ctx.db.literal(v.data)},
          ${this.repo.ctx.db.literal(v.created.toISOString())}::timestamp,
          ${this.repo.ctx.db.literal(v.user.id)}::uuid,
          ${v.deleted ? this.repo.ctx.db.literal(v.deleted.toISOString()) : "NULL"}::timestamp
          )`
        ))
          .join(",");

        const users = vs.map((v) => this.repo.ctx.db.literal(v.user.id)).join(",")
        const ids = vs.map((v) => this.repo.ctx.db.literal(v.id))

        return (
          `
          INSERT INTO account.sign(id, type, data, created, "user", deleted)
          VALUES ${values}
          UNION ALL
          SELECT id, type, data, created, "user", NOW()
            FROM account.sign
            WHERE
              account.sign."user" IN(${users})
              AND
              account.sign.id NOT IN(${ids})
          ON CONFLICT(id)
            DO UPDATE
              SET
                data=EXCLUDED.data,
                deleted=EXCLUDED.deleted
              WHERE (sign.data, sign.deleted)!=(EXCLUDED.data, EXCLUDED.deleted)
          `
        )
      }

      private email(vs: account.Email[]): string {
        const values = vs.map((email) => (
          `(
          ${this.repo.ctx.db.literal(email.id)}::uuid,
          ${this.repo.ctx.db.literal(email.address)},
          ${this.repo.ctx.db.literal(email.created.toISOString())}::timestamp,
          ${email.confirmed ? this.repo.ctx.db.literal(email.confirmed.toISOString()) : "NULL"}::timestamp,
          ${this.repo.ctx.db.literal(email.user.id)}::uuid,
          ${email.deleted ? this.repo.ctx.db.literal(email.deleted.toISOString()) : "NULL"}::timestamp
          )`
        )).join(",");

        const users = vs.map((v) => this.repo.ctx.db.literal(v.user.id)).join(",")
        const ids = vs.map((v) => this.repo.ctx.db.literal(v.id))

        return (
          `INSERT INTO account.email(id, address, created, confirmed, "user", deleted)
          VALUES ${values}
          UNION ALL
          SELECT id, address, created, confirmed, "user", NOW()
            FROM account.email
            WHERE
              account.email."user" IN(${users})
              AND
              account.email.id NOT IN(${ids})
          ON CONFLICT(id)
            DO UPDATE
              SET
                confirmed=EXCLUDED.confirmed,
                deleted=EXCLUDED.deleted
              WHERE (email.confirmed)!=(EXCLUDED.confirmed)`
        )
      }

      private user(vs: account.User[]): string {
        const values = vs.map((v) => (
          `(
          ${this.repo.ctx.db.literal(v.id)}::uuid,
          ${v.avatar ? this.repo.ctx.db.literal(v.avatar) : "NULL"},
          ${this.repo.ctx.db.literal(v.created.toISOString())}::timestamp,
          ${this.repo.ctx.db.literal(v.name)},
          ${v.deleted ? this.repo.ctx.db.literal(v.deleted.toISOString()) : "NULL"}::timestamp
          )`
        )).join(",");

        return (
          `
          INSERT INTO account.user(id, avatar, created, name, deleted)
          VALUES ${values}
          ON CONFLICT(id)
            DO UPDATE
              SET
                name=EXCLUDED.name,
                avatar=EXCLUDED.avatar,
                deleted=EXCLUDED.deleted
              WHERE ("user".name, "user".avatar, "user".deleted)!=(EXCLUDED.name,EXCLUDED.avatar,EXCLUDED.deleted)
          `
        )
      }

      public build(vs: account.User[]): string {
        return (
          `
          WITH
            users AS (${this.user(vs)}),
            emails AS (${this.email(vs.map((v) => v.emails).flat())}),
            signs AS (${this.sign(vs.map((v) => v.signs).flat())})
          SELECT 1
          `
        )
      }
    }(this.repo)
  }(this);

  public readonly finder = new class Reader {
    constructor(private readonly repo: User) { }
    public id(n: account.User["id"] | account.User["id"][]) {
      if (Array.isArray(n)) return this.filter(["in", "id", n]);
      return this.filter(["=", "id", n]);
    }

    #limit?: number;
    public limit(n?: number): Reader {
      const reader = this.clone();
      reader.#limit = n;
      return reader;
    }
    #skip?: number;
    public skip(n?: number): Reader {
      const reader = this.clone();
      reader.#skip = n;
      return reader;
    }
    #filter?: User.Filter;
    public filter(n?: User.Filter): Reader {
      const reader = this.clone();
      reader.#filter = n && this.#filter ? ["&", [this.#filter, n]] : n;
      return reader;
    }
    private clone() {
      const reader = new Reader(this.repo);
      reader.#filter = this.#filter;
      reader.#skip = this.#skip;
      reader.#limit = this.#limit;
      return reader;
    }
    public async one(): Promise<account.User | null> {
      const items = await this.limit(1).all();
      return items[0] ?? null;
    }
    public async assoc() {
      const users = await this.all();
      return new Map(users.map((user) => [user.id, user]))
    }
    public async all(): Promise<account.User[]> {

      const query = this.repo.builder.reader.build({ filter: this.#filter, limit: this.#limit, skip: this.#skip })
      const result = await this.repo.ctx.db.query<Raw>(query);
      const users: account.User[] = []

      for (const row of result.rows) {
        const user = new account.User({
          id: row.id,
          avatar: row.avatar,
          created: row.created,
          name: row.name,
          deleted: row.deleted,
        });

        users.push(user);

        for (const email of row.emails) {
          user.emails.push(new account.Email({
            id: email.id,
            user,
            address: email.address,
            confirmed: email.confirmed ? new Date(email.confirmed) : null,
            created: new Date(email.created),
            deleted: email.deleted ? new Date(email.deleted) : null,
          }))
        }

        for (const sign of row.signs) {
          user.signs.push(new account.Sign({
            id: sign.id,
            user,
            data: sign.data,
            type: sign.type as account.Sign.Type,
            created: new Date(sign.created),
            deleted: sign.deleted ? new Date(sign.deleted) : null,
          }))
        }

      }

      return users;
    }
  }(this);

  public async save(...users: account.User[]): Promise<void> {
    if (users.length === 0) return;
    const query = this.builder.writer.build(users);
    await this.ctx.db.query(query);
  }
}
export namespace User {
  export type Condition = {
    filter?: Filter
    limit?: number
    skip?: number
  }
  export type Filter = (
    | readonly ["&" | "|", Filter[]]
    | readonly ["=", "id", account.User["id"]]
    | readonly ["in", "id", account.User["id"][]]
    | readonly ["=", "signs", Filter.Sign]
    | readonly ["=", "emails", Filter.Email]
  );
  export namespace Filter {
    export type Sign = (
      | readonly ["&" | "|", Filter.Sign[]]
      | readonly ["=", "id", account.Sign["id"]]
      | readonly ["=", "type", account.Sign["type"]]
      | readonly ["=", "data", account.Sign["data"]]
      | readonly ["=", "deleted", boolean]
      | readonly ["=", "user", account.Sign["user"]["id"]]
      | readonly ["in", "id", account.Sign["id"][]]
    )
    export type Email = (
      | readonly ["&" | "|", Filter.Email[]]
      | readonly ["=", "id", account.Email["id"]]
      | readonly ["=", "address", account.Email["address"]]
      | readonly ["=", "confirmed", boolean]
      | readonly ["=", "deleted", boolean]
      | readonly ["=", "user", account.Email["user"]["id"]]
      | readonly ["in", "id", account.Email["id"][]]
    )
  }
}
export default User;
