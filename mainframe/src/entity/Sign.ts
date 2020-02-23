import uuid from "uuid/v4";
import validator from "validator";
import { Account } from ".";
export type Property = Pick<Entity, "type" | "data" | "owner"> & Partial<Pick<Entity, "id" | "created">>;

export class Entity {
  public readonly id: string;
  readonly type: Entity.Type;
  readonly data: string;
  public readonly created: Date;
  public readonly owner: Account;
  constructor(p: Property) {
    this.id = p.id ?? uuid();
    this.type = p.type;
    this.data = p.data;
    this.created = p.created ?? new Date();
    this.owner = p.owner;
  }
}
export namespace Entity {
  export type Type = "facebook" | "password"
  export namespace Kind {
    export function is(v: any): v is Type {
      return typeof v === "string" && validator.isIn(v, ["facebook", "password"]);
    }
  }
}

export default Entity;
