import * as uuid from "uuid";
import Sign from "./Sign";
import User from "./User";

export class Token {
  public readonly id: string;
  public ip: string | null;
  public readonly created: Date;
  public updated: Date;
  public deleted: Date | null;
  public expired: Date | null;
  public readonly user: User;
  public readonly sign: Sign | null;
  constructor(p: Token.Property) {
    const now = new Date();
    this.id = p.id ?? uuid.v4();
    this.ip = p.ip ?? null;
    this.created = p.created ?? now;
    this.updated = p.updated ?? now;
    this.deleted = p.deleted ?? null;
    this.expired = p.expired ?? null;
    this.user = p.user;
    this.sign = p.sign ?? null;
  }

  public get isDeleted() {
    return this.deleted !== null;
  }
  public set isDeleted(value: boolean) {
    this.deleted = value ? (this.deleted ?? new Date()) : null;
  }
  public get isExpired() {
    return this.expired !== null && this.expired.getTime() < new Date().getTime();
  }
}

export namespace Token {
  export type Property = (
    & Pick<Token, (
      | "user"
    )>
    & Partial<Pick<Token,
      | "ip"
      | "id"
      | "created"
      | "updated"
      | "deleted"
      | "expired"
      | "sign"
    >>
  );

}

export default Token;
