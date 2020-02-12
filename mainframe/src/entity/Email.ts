import uuid from "uuid/v4";
import Account from "./Account";

export type Property = Pick<Entity, (
  | "address"
  | "owner"
)> & Partial<Pick<Entity, (
  | "created"
  | "confirmed"
  | "deleted"
  | "id"
)>>;
export class Entity {
  public readonly id: string;
  public readonly created: Date;
  public address: string;
  public confirmed: Date | null;
  public deleted: Date | null;
  public readonly owner: Account;

  constructor(p: Property) {
    this.id = p.id ?? uuid();
    this.address = p.address;
    this.confirmed = p.confirmed ?? null;
    this.created = p.created ?? new Date();
    this.owner = p.owner;
    this.deleted = p.deleted ?? null;
  }

  public get isConfirmed() {
    return this.confirmed !== null;
  }

  public get isDeleted() {
    return this.confirmed !== null;
  }
}

export default Entity;
