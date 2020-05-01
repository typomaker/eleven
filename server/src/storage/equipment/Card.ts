import * as entity from "../../entity";
import Context from "../Context";
import Stash from "../Stash";
type Sorter = Partial<Record<"created" | "deleted", "<" | ">">>;

type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.equipment.Card["id"]]
  | ["=", "origin", entity.equipment.Card["id"] | null]
  | ["=", "user", entity.account.User["id"] | null]
  | ["=", "isBasic", boolean]
  | ["=", "isDeleted", boolean]
  | ["in", "id", entity.equipment.Card["id"][]]
);

interface Raw {
  id: string;
  origin: string | null;
  name: string;
  basic: boolean;
  created: Date;
  deleted: Date | null;
  user: string | null;
  traits: string[];
}
export class Card {
  constructor(private readonly ctx: Context) { }

  public readonly stash = new class extends Stash<entity.equipment.Card, Raw, entity.equipment.Card["id"]> {
    constructor(private readonly repo: Card) {
      super();
    }
    public async load(values: string[] | Raw[]): Promise<string[]> {
      if (values.length === 0) {
        return [];
      }
      const ids: string[] = [];
      const raws: Raw[] = [];
      const result: string[] = [];
      for (const value of values) {
        if (typeof value === "string") {
          ids.push(value);
        } else {
          raws.push(value);
        }
      }
      if (ids.length) {
        const unstashed = ids.filter((id) => !this.has(id));
        if (unstashed.length) await this.repo.find().filter(["in", "id", unstashed]).load();
        result.push(...this.filter(ids));
      }
      if (raws.length) {
        const unstashed = raws.filter((raw) => !this.has(raw.id));
        if (unstashed.length) {
          for (const raw of unstashed) {
            this.register(raw.id, () => new entity.equipment.Card({
              id: raw.id,
              name: raw.name,
              basic: raw.basic,
              created: raw.created,
              deleted: raw.deleted,
            }));
          }
          await this.repo.ctx.equipment.trait.stash.load(unstashed.map((raw) => raw.traits).flat());
        }
        result.push(...this.filter(raws.map((raw) => raw.id)));
      }

      return result;
    }
  }(this);

  public find(filter?: Filter) {
    /** @deprecated */
    const repo = this;
    return new class Finder {
      constructor(private readonly repo: Card) { }

      public delete(): Promise<entity.equipment.Card> {
        throw new Error("Method not implemented.");
      }

      #limit?: number;
      public limit(n?: number): Finder {
        const reader = this.clone();
        reader.#limit = n;
        return reader;
      }

      #skip?: number;
      public skip(n?: number): Finder {
        const reader = this.clone();
        reader.#skip = n;
        return reader;
      }

      #filter?: Filter = filter;
      public filter(n?: Filter): Finder {
        const reader = this.clone();
        reader.#filter = n && this.#filter ? ["&", [this.#filter, n]] : n;
        return reader;
      }

      #sort?: Sorter;
      public sort(n?: Sorter) {
        const reader = this.clone();
        reader.#sort = n && { ...this.#sort, ...n };
        return reader;
      }

      public clone() {
        const reader = new Finder(this.repo);
        reader.#filter = this.#filter;
        reader.#skip = this.#skip;
        reader.#limit = this.#limit;
        reader.#sort = this.#sort;
        return reader;
      }

      public id(n: entity.equipment.Card["id"] | entity.equipment.Card["id"][]): Finder {
        if (Array.isArray(n)) return this.filter(["in", "id", n]);
        return this.filter(["=", "id", n]);
      }

      public origin(n: entity.equipment.Card["id"]) {
        return this.filter(["=", "origin", n]);
      }

      public user(n: entity.account.User["id"] | null) {
        return this.filter(["=", "user", n]);
      }

      public isBasic(n: boolean) {
        return this.filter(["=", "isBasic", n]);
      }

      public isDeleted(n: boolean) {
        return this.filter(["=", "isDeleted", n]);
      }

      public build(): string {
        let query = (
          `SELECT
            *,
            traits.id as traits
          FROM
            equipment.card,
            LATERAL (
              SELECT json_agg(trait.id) as id
              FROM equipment.trait
              WHERE trait.card = card.id
            ) traits`
        );
        if (this.#filter) query += " WHERE " + this.buildFilter(this.#filter);
        if (this.#limit) query += " LIMIT " + Number(this.#limit);
        if (this.#skip) query += " OFFSET " + Number(this.#skip);
        return query;
      }

      public async load(): Promise<string[]> {
        return await repo.ctx.db.connect(async () => {
          const sql = this.build();
          const response = await repo.ctx.db.query<Raw>(sql);
          return await this.repo.stash.load(response.rows);
        });
      }

      public async one(): Promise<entity.equipment.Card | null> {
        const items = await this.limit(1).all();
        return items[0] ?? null;
      }

      public async all(): Promise<entity.equipment.Card[]> {
        const ids = await this.load();
        return this.repo.stash.pick(ids);
      }

      private buildFilter(n: Filter): string {
        switch (n[0]) {
          case "|": case "&": return "(" + n[1].map(this.buildFilter.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
          case "=": switch (n[1]) {
            case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
            case "origin": return "origin" + (n[2] === null ? " IS NULL" : `=${this.repo.ctx.db.literal(n[2])}`);
            case "user": return "user" + (n[2] === null ? " IS NULL" : `=${this.repo.ctx.db.literal(n[2])}`);
            case "isBasic": return `is_basic=${n[2] ? "TRUE" : "FALSE"}`;
            case "isDeleted": return `deleted ${n[2] ? "IS" : "IS NOT"} NULL`;
          }
          case "in": switch (n[1]) {
            case "id": return n[2].length ? `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})` : "FALSE";
          }
        }
      }
    }(this);
  }

  public async save(emails: entity.equipment.Card | entity.equipment.Card[]): Promise<void> {
    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    if (emails.length === 0) return;
    const sql = `
      INSERT INTO equipment.card(id, origin, name, user, is_basic, created, deleted)
      VALUES
      (${
      emails.map((v) => [
        this.ctx.db.literal(v.id),
        v.origin ? this.ctx.db.literal(v.origin.id) : "NULL",
        this.ctx.db.literal(v.name),
        v.user ? this.ctx.db.literal(v.user.id) : "NULL",
        v.basic ? "TRUE" : "FALSE",
        this.ctx.db.literal(v.created.toISOString()),
        v.deleted ? this.ctx.db.literal(v.deleted.toISOString()) : "NULL",
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET origin=EXCLUDED.origin,
              name=EXCLUDED.name,
              user=EXCLUDED.user,
              is_basic=EXCLUDED.is_basic,
              deleted=EXCLUDED.deleted
          WHERE (
              card.origin,
              card.name,
              card.user,
              card.is_basic,
              card.deleted
            )!=(
              EXCLUDED.origin,
              EXCLUDED.name,
              EXCLUDED.user,
              EXCLUDED.is_basic,
              EXCLUDED.deleted
            )
    `;
    await this.ctx.db.query(sql);
  }
}
export default Card;
