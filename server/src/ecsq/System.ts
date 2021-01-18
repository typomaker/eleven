import Entity from "./Entity";
import Query from "./Query";
import World from "./World";

export abstract class System<T extends Entity> {
  readonly query: { [K: string]: Query<T> } = {}

  public enabled(world: World<T>): Promise<void> {
    return Promise.resolve();
  }
  public disabled(world: World<T>): Promise<void> {
    return Promise.resolve();
  }
  public updated(world: World<T>): Promise<void> {
    return Promise.resolve();
  }
  public started(world: World<T>): Promise<void> {
    return Promise.resolve();
  }
  public stoped(world: World<T>): Promise<void> {
    return Promise.resolve();
  }
}
export default System;