import uuid from "uuid/v4";
import Card from "./Card";

export class Trait {
  public id: string;
  public card: Card;
  public source: Card;

  constructor(p: Behavior.Property) {
    this.id = p.id ?? uuid();
    this.card = p.card;
    this.source = p.source;
  }

  public clone() {
    return new Trait({
      ...this,
      id: null,
    });
  }
}
export namespace Behavior {
  export type Property =
    & Pick<Trait, (
      | "card"
      | "source"
    )>
    & Pick<Partial<Trait>, (
      | "id"
    )>;
}
export default Trait;
