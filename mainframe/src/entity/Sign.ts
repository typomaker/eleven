import uuid from "uuid/v4";
import validator from "validator";
import { Account } from ".";
export type Property = Pick<Entity, "kind" | "data" | "owner"> & Partial<Pick<Entity, "id" | "created">>;

export class Entity {
  public readonly id: string;
  readonly kind: Entity.Kind;
  readonly data: string;
  public readonly created: Date;
  public readonly owner: Account;
  constructor(p: Property) {
    this.id = p.id ?? uuid();
    this.kind = p.kind;
    this.data = p.data;
    this.created = p.created ?? new Date();
    this.owner = p.owner;
  }
}
export namespace Entity {
  export type Kind = "facebook" | "password"
  export namespace Kind {
    export function is(v: any): v is Kind {
      return validator.isIn(v, ["facebook", "password"]);
    }
  }
}

export default Entity;
