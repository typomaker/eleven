import uuid from "uuid/v4";
import * as account from "../account";
import Combination from "./Combintation";
import Slot from "./Slot";
import Trait from "./Trait";

export class Card {
  public id: string;
  public origin: Card | null;
  public name: string;
  public user: account.User | null;
  public readonly basic: boolean;
  public readonly traits: Trait[];
  public readonly combinations: Combination[];
  public readonly slots: Slot[];
  public readonly created: Date;
  public deleted: Date | null;

  constructor(p: Card.Property) {
    this.id = p.id ?? uuid();
    this.origin = p.origin ?? null;
    this.name = p.name;
    this.user = p.user ?? null;
    this.traits = p.traits ?? [];
    this.slots = p.slots ?? [];
    this.combinations = p.combinations ?? [];
    this.basic = p.basic ?? false;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }
  public clone() {
    return new Card({
      ...this,
      id: null,
      origin: this.origin ?? this,
    });
  }
}
export namespace Card {
  export type Property = (
    & Pick<Card, (
      | "name"
    )>
    & Pick<Partial<Card>, (
      | "id"
      | "origin"
      | "basic"
      | "user"
      | "traits"
      | "combinations"
      | "slots"
      | "created"
      | "deleted"

    )>
  );
}
export default Card;
