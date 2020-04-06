import uuid from "uuid/v4";
import Card from "../equipment/Card";
import Member from "./Member";
import Party from "./Party";

export class Turn {
  public id: string;
  public party: Party;
  public member: Member;
  public target: Card | null;
  public from: Card | null;
  public to: Card | null;
  public created: Date;
  public completed: Date | null;

  constructor(p: Lobby.Property) {
    this.id = p.id ?? uuid();
    this.party = p.party;
    this.member = p.member;
    this.target = p.target ?? null;
    this.from = p.from ?? null;
    this.to = p.to ?? null;
    this.created = p.created ?? new Date();
    this.completed = p.completed ?? null;
  }
}
export namespace Lobby {
  export type Property =
    & Pick<Turn, (
      | "party"
      | "member"
    )>
    & Pick<Partial<Turn>, (
      | "id"
      | "target"
      | "from"
      | "to"
      | "created"
      | "completed"
    )>;
}
export default Turn;
