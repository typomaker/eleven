import uuid from "uuid/v4";
import Card from "../equipment/Card";
import Event from "./Event";

export class Trophy {
  public id: string;
  public event: Event;
  public card: Card;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Trophy.Property) {
    this.id = p.id ?? uuid();
    this.event = p.event;
    this.card = p.card;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }
}
export namespace Trophy {
  export type Property =
    & Pick<Trophy, (
      | "card"
      | "event"
    )>
    & Pick<Partial<Trophy>, (
      | "id"
      | "created"
      | "deleted"
    )>;
}
export default Trophy;
