import uuid from "uuid/v4";
import { Card } from "../equipment";
import Party from "./Party";

export class Member {
  public id: string;
  public party: Party;
  public card: Card;

  constructor(p: Member.Property) {
    this.id = p.id ?? uuid();
    this.party = p.party;
    this.card = p.card;
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
      | "card"
    )>
    & Pick<Partial<Member>, (
      | "id"
    )>;
}
export default Member;
