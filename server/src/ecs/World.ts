
import { performance } from "perf_hooks";
import Logger from "../logger";
import System from "./System";


export class World<T extends object>{
  private readonly system = new Set<System<T>>();

  #started = false;
  public get isStarted() {
    return this.#started;
  }
  private tick: World.Tick = {
    counter: 0,
    time: { current: performance.now(), passed: 0, origin: performance.timeOrigin }
  }

  constructor(public readonly delay: number) { }

  public async attach(system: System<T>): Promise<void> {
    this.system.add(system)
    await system.attached(this.tick)
  }

  public async detach(system: System<T>): Promise<void> {
    this.system.delete(system)
    await system.detached(this.tick)
  }

  private async loop(): Promise<void> {
    const now = performance.now();
    this.tick.time.passed = now - this.tick.time.current;
    this.tick.time.current = now
    if (this.tick.counter === Number.MAX_SAFE_INTEGER) this.tick.counter = 0;
    this.tick.counter++;

    try {
      for (const system of this.system) {
        await system.updated(this.tick);
        system.consumed.clear()
        if (system.produced.size !== 0) {
          for (const entity of system.produced) for (const consumer of this.system) if (consumer !== system) consumer.consumed.add(entity)
          system.produced.clear()
        }

      }
    } catch (error) {
      Logger.error("got error on call processed", { error });
    }

    const wait = this.delay - (performance.now() - now);
    if (wait > 0) await new Promise((ok) => setTimeout(ok, wait));

    if (!this.#started) return;
    return this.loop();
  }

  public async start(): Promise<void> {
    if (this.#started) return;
    this.#started = true;

    this.tick.time.current = performance.now()
    for (const system of this.system) await system.started(this.tick);
    return this.loop();
  }

  public async stop() {
    this.#started = false;
    for (const system of this.system) await system.stoped(this.tick);
  }
}

export namespace World {
  export type Tick = {
    counter: number
    time: { current: number, passed: number, origin: number }
  }
}
export default World;