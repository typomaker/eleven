import uuid from "uuid/v4";
import Card from "./Card";

export class Slot {
  public id: string;
  public origin: Slot | null;
  public card: Card;
  public basis: Card | null;
  public content: Card | null;

  constructor(p: Slot.Property) {
    this.id = p.id ?? uuid();
    this.origin = p.origin ?? null;
    this.card = p.card;
    this.basis = p.basis ?? null;
    this.content = p.content ?? null;
  }

  public clone() {
    return new Slot({
      ...this,
      id: null,
    });
  }
}
export namespace Slot {
  export type Property =
    & Pick<Slot, (
      | "card"
    )>
    & Pick<Partial<Slot>, (
      | "origin"
      | "id"
      | "basis"
      | "content"
    )>;
}
export default Slot;
