import uuid from "./node_modules/uuid/v4";
import Sign from "./Sign";
import User from "./User";

type Property = Pick<Token, "owner"> & Partial<Pick<Token, "ip" | "id" | "created" | "updated" | "deleted" | "expired" | "sign">>;
export class Token {
  public readonly id: string;
  public ip: string | null;
  public readonly created: Date;
  public updated: Date;
  public deleted: Date | null;
  public expired: Date | null;
  public readonly owner: User;
  public readonly sign: Sign | null;
  constructor(p: Property) {
    const now = new Date();
    this.id = p.id ?? uuid();
    this.ip = p.ip ?? null;
    this.created = p.created ?? now;
    this.updated = p.updated ?? now;
    this.deleted = p.deleted ?? null;
    this.expired = p.expired ?? null;
    this.owner = p.owner;
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

export default Token;
