import uuid from "uuid/v4";
import Card from "./Card";

export class Combination {
  public id: string;
  public card: Card;
  public input: Card;
  public output: Card;
  public isBasic: boolean;

  constructor(p: Combination.Property) {
    this.id = p.id ?? uuid();
    this.card = p.card;
    this.input = p.input ?? "";
    this.output = p.output ?? "";
    this.isBasic = p.isBasic ?? false;
  }

  public clone() {
    return new Combination({
      ...this,
      id: null,
    });
  }
}
export namespace Combination {
  export type Property =
    & Pick<Combination, (
      | "card"
      | "input"
      | "output"
    )>
    & Pick<Partial<Combination>, (
      | "id"
      | "isBasic"
    )>;
}
export default Combination;
