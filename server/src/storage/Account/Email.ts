// import * as entity from "../../entity";
// import Context from "../Context";
// import Stash from "../Stash";

// interface Raw {
//   id: string;
//   address: string;
//   confirmed: Date | null;
//   user: string;
//   created: Date;
//   deleted: Date | null;
// }
// export class Email {
//   constructor(private readonly ctx: Context) { }

//   public readonly stash = new class extends Stash<entity.account.Email, Raw, entity.account.Email["id"]> {
//     constructor(private readonly repo: Email) {
//       super();
//     }
//     public async load(values: string[] | Raw[]): Promise<string[]> {
//       if (values.length === 0) {
//         return [];
//       }
//       const ids: string[] = [];
//       const raws: Raw[] = [];
//       const result: string[] = [];
//       for (const value of values) {
//         if (!value) continue;
//         if (typeof value === "string") {
//           ids.push(value);
//         } else {
//           raws.push(value);
//         }
//       }
//       if (ids.length) {
//         const unstashed = ids.filter((id) => !this.has(id));
//         if (unstashed.length) await this.repo.finder.filter(["in", "id", unstashed]).load();
//         result.push(...this.filter(ids));
//       }
//       if (raws.length) {
//         const unstashed = raws.filter((raw) => !this.has(raw.id));
//         if (unstashed.length) {
//           for (const raw of unstashed) {
//             this.register(raw.id, () => {
//               const user = this.repo.ctx.account.user.stash.pick(raw.user)!;
//               const email = new entity.account.Email({
//                 id: raw.id,
//                 user,
//                 address: raw.address,
//                 confirmed: raw.confirmed,
//                 created: raw.created,
//                 deleted: raw.deleted,
//               });
//               user.emails.push(email);

//               return email;
//             });
//           }
//           await this.repo.ctx.account.user.stash.load(unstashed.map((row) => row.user));
//         }
//         result.push(...this.filter(raws.map((raw) => raw.id)));
//       }

//       return result;
//     }
//   }(this);

//   public readonly finder = new class Finder {
//     constructor(private readonly repo: Email) { }
//     public id(n: entity.account.Email["id"] | entity.account.Email["id"][]): Finder {
//       if (Array.isArray(n)) return this.filter(["in", "id", n]);
//       return this.filter(["=", "id", n]);
//     }

//     #limit: number | undefined;
//     public limit(n?: number): Finder {
//       const reader = this.clone();
//       reader.#limit = n;
//       return reader;
//     }

//     #skip: number | undefined;
//     public skip(n?: number): Finder {
//       const reader = this.clone();
//       reader.#skip = n;
//       return reader;
//     }

//     #filter?: Email.Filter;
//     public filter(n?: Email.Filter): Finder {
//       const reader = this.clone();
//       reader.#filter = n && this.#filter ? ["&", [this.#filter, n]] : n;
//       return reader;
//     }

//     private clone() {
//       const reader = new Finder(this.repo);
//       reader.#filter = this.#filter;
//       reader.#skip = this.#skip;
//       reader.#limit = this.#limit;
//       return reader;
//     }

//     public build() {
//       let query = "SELECT * FROM account.email";
//       if (this.#filter) query += " WHERE " + this.buildFilter(this.#filter);
//       if (this.#limit) query += " LIMIT " + Number(this.#limit);
//       if (this.#skip) query += " OFFSET " + Number(this.#skip);
//       return query;
//     }

//     public async load(): Promise<string[]> {
//       return await this.repo.ctx.db.connect(async () => {
//         const sql = this.build();
//         const response = await this.repo.ctx.db.query<Raw>(sql);
//         return await this.repo.stash.load(response.rows);
//       });
//     }

//     public async one(): Promise<entity.account.Email | null> {
//       const items = await this.limit(1).all();
//       return items[0] ?? null;
//     }

//     public async all(): Promise<entity.account.Email[]> {
//       const ids = await this.load();
//       return this.repo.stash.pick(ids);
//     }

//     private buildFilter(n: Email.Filter): string {
//       switch (n[0]) {
//         case "|": case "&": return "(" + n[1].map(this.buildFilter.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
//         case "=": switch (n[1]) {
//           case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
//           case "address": return `address=${this.repo.ctx.db.literal(n[2])}`;
//           case "confirmed": return `confirmed IS ${n[2] ? "NOT NULL" : "NULL"}`;
//           case "user": return `user=${this.repo.ctx.db.literal(n[2])}`;
//           case "deleted": return `deleted IS ${n[2] ? "NOT NULL" : "NULL"}`
//         }
//         case "in": switch (n[1]) {
//           case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
//         }
//       }
//     }
//   }(this);

//   public async save(emails: entity.account.Email | entity.account.Email[]): Promise<void> {
//     if (!Array.isArray(emails)) {
//       emails = [emails];
//     }
//     if (emails.length === 0) return;
//     const sql = `
//       INSERT INTO account.email(id, address, created, confirmed, "user", deleted)
//       VALUES
//       (${
//       emails.map((v) => [
//         this.ctx.db.literal(v.id),
//         this.ctx.db.literal(v.address),
//         this.ctx.db.literal(v.created.toISOString()),
//         v.confirmed ? this.ctx.db.literal(v.confirmed.toISOString()) : "NULL",
//         this.ctx.db.literal(v.user.id),
//         v.deleted ? this.ctx.db.literal(v.deleted.toISOString()) : "NULL"
//       ].join(",")).join("),(")
//       })
//       ON CONFLICT(id)
//         DO UPDATE
//           SET confirmed=EXCLUDED.confirmed,
//           deleted=EXCLUDED.deleted
//           WHERE (email.confirmed)!=(EXCLUDED.confirmed)
//     `;
//     await this.ctx.db.query(sql);
//   }
// }
// export namespace Email {
//   export type Filter = (
//     | readonly ["&" | "|", Filter[]]
//     | readonly ["=", "id", entity.account.Email["id"]]
//     | readonly ["=", "address", entity.account.Email["address"]]
//     | readonly ["=", "confirmed", boolean]
//     | readonly ["=", "deleted", boolean]
//     | readonly ["=", "user", entity.account.Email["user"]["id"]]
//     | readonly ["in", "id", entity.account.Email["id"][]]
//   );
// }
// export default Email;
