import * as app from "../app";
import * as ecs from "../ecs";
import World from "./World";
export class Service {
  public readonly world = new World(this.app);
  public readonly life = new ecs.Life(1000 / 60, this.world)
  constructor(private readonly app: app.Container) { }
}

export default Service;