import uuid from "uuid/v4";
import Component from "./Component";
import Entity from "./Entity";

export class State<T> {
  private data = new Map<Entity, Component<T>>();

  public create(component: Component<T>): string {
    const entity = uuid();
    this.set(entity, component);
    return entity;
  }

  public get(entity: Entity): Readonly<Component<T>> {
    if (!this.data.has(entity)) throw new Error(`Entity ${entity} is not exists`)
    return this.data.get(entity)!
  }

  public set(entity: Entity, component: Component<T> | null) {
    if (component === null) {
      this.data.delete(entity)
      return
    }
    if (this.data.has(entity)) {
      component = Component.cleanup({ ...this.get(entity), ...component });
    }
    this.data.set(entity, component)
    return entity
  }

  public has(entity: Entity) {
    return this.data.has(entity)
  }

  public find<D extends keyof T>(filter: State.Filter<T, D>): Map<Entity, Component<T, D>> {
    const result = new Map();
    for (const [entity, componenet] of this.data) {
      let ok = true;
      for (const property of filter) {
        if (componenet[property] === undefined) {
          ok = false;
          break;
        }
      }
      if (ok) {
        result.set(entity, componenet)
      }
    }

    return result;
  }

  [Symbol.iterator](): Iterable<[Entity, Component<T>]> {
    return this.data
  }
}
export namespace State {
  export type Filter<T, D extends keyof T = keyof T> = D[]
}
export default State;