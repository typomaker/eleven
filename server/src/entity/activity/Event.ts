import uuid from "uuid/v4";
import Environment from "./Environment";

export class Event {
  public id: string;
  public name: string;
  public environment: Environment[] | null;
  public created: Date;
  public deleted: Date | null;

  constructor(p: Event.Property) {
    this.id = p.id ?? uuid();
    this.name = p.name;
    this.environment = p.environment ?? null;
    this.created = p.created ?? new Date();
    this.deleted = p.deleted ?? null;
  }
  public clone() {
    return new Event({
      ...this,
      id: null,
    });
  }
}
export namespace Event {
  export type Property =
    & Pick<Event, (
      | "name"
    )>
    & Pick<Partial<Event>, (
      | "id"
      | "created"
      | "deleted"
      | "environment"
    )>;
}
export default Event;
