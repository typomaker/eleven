import { performance } from "perf_hooks";
import Component from "./Component";
import Container from "./Container";
import Entity from "./Entity";
import System from "./System";

export class World<T extends object> implements Container<Component<T>> {
  private state = {
    current: new Map<Entity, Component<T>>(),
    future: new Map<Entity, Component<T> | undefined>(),
    tick: {
      time: 0,
      delta: 0
    }
  }
  private systems = new Set<System<T>>();

  constructor(...systems: System<T>[]) {
    this.enable(new class extends System<T> {
      async update(world: World<T>): Promise<void> {
        for (let [id, component] of world.state.future) {
          if (!component) {
            world.state.current.delete(id)
          } else {
            if (world.state.current.has(id)) component = Object.assign(world.state.current.get(id), component)
            component = Component.cleanup(component);
            world.state.current.set(id, component)
          }
          for (const system of world.systems) {
            if (!system.queries) continue;
            for (const query of Object.values(system.queries)) query.set(id, component)
          }
        }
        world.state.future.clear()
      }
    }());
    for (const system of systems) this.enable(system)
  }

  public enable(system: System<T>) {
    this.systems.add(system);
  }

  public disable(system: System<T>) {
    this.systems.delete(system);
  }

  public async update() {
    if (this.state.tick.time > 0) this.state.tick.delta = performance.now() - this.state.tick.time
    this.state.tick.time = performance.now();
    for (const system of this.systems) {
      await system.update(this);
    }
  }

  public import(state: Iterable<[Entity, Component<T>]>) {
    this.state.current = new Map(state)
  }

  public export(): Iterable<[Entity, Readonly<Component<T>>]> {
    return this.state.current;
  }

  public create(component: Component<T>) {
    this.set(Entity.generate(), component)
  }

  public set(id: string, component: Component<T> | undefined) {
    if (component) component = { ...this.state.current.get(id), ...this.state.future.get(id), ...component }
    this.state.future.set(id, component)
  }

  public get(id: string): Readonly<Component<T>> | undefined {
    return this.state.current.get(id)
  }

  [Symbol.iterator](): IterableIterator<[Entity, Readonly<Component<T>>]> {
    return this.state.current.entries();
  }

  get length() {
    return this.state.current.size;
  }

  public get tick(): Readonly<World<T>["state"]["tick"]> {
    return this.state.tick
  }
}


export default World;
