import * as uuid from "uuid";
import validator from "validator";
import User from "./User";

export class Sign {
  public readonly id: string;
  public readonly type: Sign.Type;
  public readonly data: string;
  public readonly created: Date;
  public readonly deleted: Date | null;
  public readonly user: User;
  constructor(p: Sign.Property) {
    this.id = p.id ?? uuid.v4();
    this.type = p.type;
    this.data = p.data;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
    this.user = p.user;
  }
}
export namespace Sign {
  export type Property = (
    & Pick<Sign, (
      | "type"
      | "data"
      | "user"
    )>
    & Pick<Partial<Sign>, (
      | "id"
      | "created"
      | "deleted"
    )>
  );
  export type Type = "facebook" | "password";
  export namespace Kind {
    export function is(v: any): v is Type {
      return typeof v === "string" && validator.isIn(v, ["facebook", "password"]);
    }
  }
}

export default Sign;
