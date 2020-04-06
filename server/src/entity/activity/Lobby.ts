import uuid from "uuid/v4";
import Deck from "../equipment/Deck";
import Event from "./Event";

export class Lobby {
  public id: string;
  public event: Event;
  public deck: Deck;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Lobby.Property) {
    this.id = p.id ?? uuid();
    this.event = p.event;
    this.deck = p.deck;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }

  public clone() {
    return new Lobby({
      ...this,
      id: null,
    });
  }
}
export namespace Lobby {
  export type Property =
    & Pick<Lobby, (
      | "deck"
      | "event"
    )>
    & Pick<Partial<Lobby>, (
      | "id"
      | "created"
      | "deleted"
    )>;
}
export default Lobby;
