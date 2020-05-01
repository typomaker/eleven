import uuid from "uuid/v4";
import { Card } from "../equipment";
import Event from "./Event";

export class Environment {
  public id: string;
  public event: Event;
  public card: Card;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Environment.Property) {
    this.id = p.id ?? uuid();
    this.event = p.event;
    this.card = p.card;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }

  public clone() {
    return new Environment({
      ...this,
      id: null,
    });
  }
}
export namespace Environment {
  export type Property =
    & Pick<Environment, (
      | "card"
      | "event"
    )>
    & Pick<Partial<Environment>, (
      | "id"
      | "created"
      | "deleted"
    )>;
}
export default Environment;
