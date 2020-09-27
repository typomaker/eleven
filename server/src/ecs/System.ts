import Query from "./Query";
import World from "./World";

export abstract class System<T extends object> {
  abstract update(world: World<T>): Promise<void>;
  queries?: {
    [K: string]: Query<T>
  }
}
export namespace System {

}

export default System;