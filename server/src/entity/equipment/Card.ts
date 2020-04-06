import uuid from "uuid/v4";
import * as account from "../account";
import Behavior from "./Behavior";
import Combination from "./Combintation";
import Deck from "./Deck";
import Slot from "./Slot";

export class Card {
  #behavior: Behavior[] | null;
  #combination: Combination[] | null;
  #slot: Slot[] | null;

  public id: string;
  public origin: Card | null;
  public name: string;
  public account: account.User | null;
  public deck: Deck | null;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Card.Property = {}) {
    this.id = p.id ?? uuid();
    this.origin = p.origin ?? null;
    this.name = p.name ?? "";
    this.account = p.account ?? null;
    this.deck = p.deck ?? null;
    this.#behavior = p.behavior ?? null;
    this.#combination = p.combination ?? null;
    this.#slot = p.slot ?? null;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }
  get behavior(): Behavior[] | null {
    return this.#behavior ?? this.origin?.behavior ?? null;
  }
  get combination(): Combination[] | null {
    return this.#combination ?? this.origin?.combination ?? null;
  }
  get slot(): Slot[] | null {
    return this.#slot ?? this.origin?.slot ?? null;
  }
  public clone() {
    return new Card({
      ...this,
      id: null,
      origin: this,
    });
  }
}
export namespace Card {
  export type Property = Pick<Partial<Card>, (
    | "id"
    | "name"
    | "origin"
    | "account"
    | "deck"
    | "behavior"
    | "combination"
    | "slot"
    | "created"
    | "deleted"

  )>;
}
export default Card;
