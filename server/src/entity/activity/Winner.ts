import uuid from "uuid/v4";
import Member from "./Member";
import Party from "./Party";

export class Winner {
  public id: string;
  public party: Party;
  public member: Member;
  public created: Date;

  constructor(p: Winner.Property) {
    this.id = p.id ?? uuid();
    this.party = p.party;
    this.member = p.member;
    this.created = p.created ?? new Date();
  }
}
export namespace Winner {
  export type Property =
    & Pick<Winner, (
      | "party"
      | "member"
    )>
    & Pick<Partial<Winner>, (
      | "id"
      | "created"
    )>;
}
export default Winner;
