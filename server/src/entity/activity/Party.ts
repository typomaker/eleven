import uuid from "uuid/v4";
import Event from "./Event";
import Member from "./Member";
import Turn from "./Turn";
import Winner from "./Winner";

export class Party {
  public id: string;
  public event: Event;
  public member: Member[];
  public turn: Turn[] | null;
  public winner: Winner[] | null;
  public created: Date;
  public completed: Date | null;
  public deleted: Date | null;

  constructor(p: Party.Property) {
    this.id = p.id ?? uuid();
    this.event = p.event;
    this.member = p.member;
    this.turn = p.turn ?? null;
    this.winner = p.winner ?? null;
    this.created = p.created ?? new Date();
    this.completed = p.completed ?? null;
    this.deleted = p.deleted ?? null;
  }
}
export namespace Party {
  export type Property =
    & Pick<Party, (
      | "event"
      | "member"
    )>
    & Pick<Partial<Party>, (
      | "id"
      | "turn"
      | "winner"
      | "created"
      | "completed"
      | "deleted"
    )>;
}
export default Party;
