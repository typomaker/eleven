import uuid from "uuid/v4";
import validator from "validator";
import Account from "./User";
export type Property = Pick<Sign, "type" | "data" | "owner"> & Partial<Pick<Sign, "id" | "created">>;

export class Sign {
  public readonly id: string;
  public readonly type: Sign.Type;
  public readonly data: string;
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
export namespace Sign {
  export type Type = "facebook" | "password";
  export namespace Kind {
    export function is(v: any): v is Type {
      return typeof v === "string" && validator.isIn(v, ["facebook", "password"]);
    }
  }
}

export default Sign;
