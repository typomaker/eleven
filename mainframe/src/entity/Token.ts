import uuid from "uuid/v4";
import { Account, Sign } from ".";

type Property = Pick<Entity, "owner" | "sign"> & Partial<Pick<Entity, "ip" | "id" | "created" | "updated" | "deleted" | "expired">>;
export class Entity {
  public readonly id: string;
  public ip: string | null;
  public readonly created: Date;
  public updated: Date;
  public deleted: Date | null;
  public expired: Date | null;
  public readonly owner: Account;
  public readonly sign: Sign | null
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

  public get isExpired() {
    return this.expired !== null && this.expired.getTime() < new Date().getTime();
  }
}

export default Entity;
