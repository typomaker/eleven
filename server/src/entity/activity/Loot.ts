import uuid from "uuid/v4";
import Trophy from "./Trophy";
import Winner from "./Winner";

export class Loot {
  public id: string;
  public winner: Winner;
  public trophy: Trophy;
  public created: Date;

  constructor(p: Loot.Property) {
    this.id = p.id ?? uuid();
    this.winner = p.winner;
    this.trophy = p.trophy;
    this.created = p.created ?? new Date();
  }
}
export namespace Loot {
  export type Property =
    & Pick<Loot, (
      | "winner"
      | "trophy"
    )>
    & Pick<Partial<Loot>, (
      | "id"
      | "created"
    )>;
}
export default Loot;
