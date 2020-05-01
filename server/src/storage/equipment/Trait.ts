import * as entity from "../../entity";
import Context from "../Context";
import Stash from "../Stash";

type Filter = (
  | ["&" | "|", Filter[]]
  | ["=", "id", entity.equipment.Trait["id"]]
  | ["=", "card", entity.equipment.Card["id"]]
  | ["=", "source", entity.equipment.Card["id"]]
  | ["in", "id", entity.equipment.Trait["id"][]]
  | ["in", "card", entity.equipment.Card["id"][]]
);
interface Raw {
  id: string;
  card: string;
  source: string;
}

export class Trait {
  constructor(private readonly ctx: Context) { }

  public readonly stash = new class extends Stash<entity.equipment.Trait, Raw, entity.equipment.Trait["id"]> {
    constructor(private readonly repo: Trait) {
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
        if (unstashed.length) await this.repo.finder.filter(["in", "id", unstashed]).load();
        result.push(...this.filter(ids));
      }
      if (raws.length) {
        const unstashed = raws.filter((raw) => !this.has(raw.id));
        if (unstashed.length) {
          for (const raw of unstashed) {
            this.register(raw.id, () => {
              const card = this.repo.ctx.equipment.card.stash.pick(raw.card)!;
              const trait = new entity.equipment.Trait({
                id: raw.id,
                card,
                source: this.repo.ctx.equipment.card.stash.pick(raw.source)!,
              });
              card.traits.push(trait);

              return trait;
            });
          }
          await this.repo.ctx.equipment.card.stash.load(unstashed.map((row) => [row.card, row.source]).flat());
        }
        result.push(...this.filter(raws.map((raw) => raw.id)));
      }

      return result;
    }
  }(this);

  public readonly finder = new class Finder {
    constructor(private readonly repo: Trait) { }
    public id(n: entity.equipment.Trait["id"] | entity.equipment.Trait["id"][]): Finder {
      if (Array.isArray(n)) return this.filter(["in", "id", n]);
      return this.filter(["=", "id", n]);
    }

    public card(n: entity.equipment.Card["id"] | entity.equipment.Card["id"][]) {
      if (Array.isArray(n)) return this.filter(["in", "card", n]);
      return this.filter(["=", "card", n]);
    }

    public source(n: entity.equipment.Card["id"]) {
      return this.filter(["=", "source", n]);
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

    #filter?: Filter;
    public filter(n?: Filter): Finder {
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
      let query = "SELECT * FROM equipment.trait";
      if (this.#filter) query += " WHERE " + this.buildFilter(this.#filter);
      if (this.#limit) query += " LIMIT " + Number(this.#limit);
      if (this.#skip) query += " OFFSET " + Number(this.#skip);
      return query;
    }

    public async load(): Promise<string[]> {
      return await this.repo.ctx.db.connect(async () => {
        const sql = this.build();
        const response = await this.repo.ctx.db.query<Raw>(sql);
        return await this.repo.stash.load(response.rows);
      });
    }

    public async one(): Promise<entity.equipment.Trait | null> {
      const items = await this.limit(1).all();
      return items[0] ?? null;
    }

    public async all(): Promise<entity.equipment.Trait[]> {
      const ids = await this.load();
      return this.repo.stash.pick(ids);
    }

    private buildFilter(n: Filter): string {
      switch (n[0]) {
        case "|": case "&": return "(" + n[1].map(this.buildFilter.bind(this)).join({ "|": " OR ", "&": " AND " }[n[0]]) + ")";
        case "=": switch (n[1]) {
          case "id": return `id=${this.repo.ctx.db.literal(n[2])}`;
          case "card": return `card=${this.repo.ctx.db.literal(n[2])}`;
          case "source": return `source=${this.repo.ctx.db.literal(n[2])}`;
        }
        case "in": switch (n[1]) {
          case "id": return `id IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
          case "card": return `card IN(${n[2].map(this.repo.ctx.db.literal).join(",")})`;
        }
      }
    }
  }(this);

  public async save(emails: entity.equipment.Trait | entity.equipment.Trait[]): Promise<void> {
    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    if (emails.length === 0) return;
    const sql = `
      INSERT INTO equipment.trait(id, card, source)
      VALUES
      (${
      emails.map((v) => [
        this.ctx.db.literal(v.id),
        this.ctx.db.literal(v.card.id),
        this.ctx.db.literal(v.source.id),
      ]).join("),(")
      })
      ON CONFLICT(id)
        DO UPDATE
          SET card=EXCLUDED.card,
              source=EXCLUDED.source
          WHERE (
              trait.card,
              trait.source
            )!=(
              EXCLUDED.card,
              EXCLUDED.source
            )
    `;
    await this.ctx.db.query(sql);
  }
}
export default Trait;
