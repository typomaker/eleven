import uuid from "uuid/v4";
import Deck from "../equipment/Deck";
import Party from "./Party";

export class Member {
  public id: string;
  public party: Party;
  public deck: Deck;

  constructor(p: Member.Property) {
    this.id = p.id ?? uuid();
    this.party = p.party;
    this.deck = p.deck;
  }

  public clone() {
    return new Member({
      ...this,
      id: null,
    });
  }
}
export namespace Member {
  export type Property =
    & Pick<Member, (
      | "party"
      | "deck"
    )>
    & Pick<Partial<Member>, (
      | "id"
    )>;
}
export default Member;
