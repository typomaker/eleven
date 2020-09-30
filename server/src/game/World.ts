import Container from "../app/Container";
import * as ecs from "../ecs";
import Entity from "./Entity";

export class World extends ecs.World<Entity> {
  constructor(private readonly app: Container) {
    super()
  }
}
export default World;