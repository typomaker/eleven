
import { performance } from "perf_hooks";
import Container from "./Container";
import Entity from "./Entity";
import Query from "./Query";
import System from "./System";

export abstract class World<T extends Entity> extends Container<T> {
  private readonly system = new Set<System<T>>()
  private readonly query = new Set<Query<T>>();
  #started = false;
  public get isStarted() {
    return this.#started;
  }

  #prev = 0;

  #delta = 0;
  public get delta() {
    return this.#delta
  }

  constructor(public readonly delay: number) {
    super();
  }

  public set(id: any, component: T | undefined): void {
    super.set(id, component);
    for (const query of this.query) query.set(id, component);
  }

  public async enable(system: System<T>): Promise<void> {
    this.system.add(system);
    for (const query of Object.values(system.query)) this.query.add(query);
    await system.enabled(this);
  }

  public async disable(system: System<T>): Promise<void> {
    this.system.delete(system);
    for (const query of Object.values(system.query)) this.query.delete(query);
    await system.disabled(this);
  }

  public async start(): Promise<void> {
    if (this.#started) return;
    this.#started = true;

    const frame = async (): Promise<void> => {
      if (!this.#started) return;
      const now = performance.now();
      this.#delta = now - this.#prev;
      for (const system of this.system) await system.updated(this);
      const wait = this.delay - (performance.now() - now);
      if (wait > 0) await new Promise((ok) => setTimeout(ok, wait));
      this.#prev = now;
      return frame();
    }

    this.#prev = performance.now();
    for (const system of this.system) await system.started(this);
    return frame();
  }

  public async stop() {
    this.#started = false;
    for (const system of this.system) await system.stoped(this);
  }
}
export default World;