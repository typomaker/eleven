import uuid from "uuid/v4";
import Card from "./Card";

export class Behavior {
  public id: string;
  public card: Card;
  public source: Card;

  constructor(p: Behavior.Property) {
    this.id = p.id ?? uuid();
    this.card = p.card;
    this.source = p.source ?? "";
  }

  public clone() {
    return new Behavior({
      ...this,
      id: null,
    });
  }
}
export namespace Behavior {
  export type Property =
    & Pick<Behavior, (
      | "card"
      | "source"
    )>
    & Pick<Partial<Behavior>, (
      | "id"
    )>;
}
export default Behavior;
