import uuid from "uuid/v4";
import * as account from "../account";

export class Deck {
  public id: string;
  public origin: Deck | null;
  public name: string;
  public account: account.User | null;
  public isBasic: boolean;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Deck.Property = {}) {
    this.id = p.id ?? uuid();
    this.origin = p.origin ?? null;
    this.name = p.name ?? "";
    this.account = p.account ?? null;
    this.isBasic = p.isBasic ?? false;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }

  public clone() {
    return new Deck({
      ...this,
      id: null,
      origin: this,
    });
  }
}
export namespace Deck {
  export type Property = Pick<Partial<Deck>, (
    | "id"
    | "name"
    | "origin"
    | "account"
    | "isBasic"
    | "created"
    | "deleted"
  )>;
}
export default Deck;
