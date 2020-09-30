import { performance } from "perf_hooks";
import World from "./World";

export class Life<T extends object> {
  private started = false;
  constructor(public readonly delay: number, private readonly world: World<T>) { }

  public async start() {
    if (this.started) return;
    this.started = true;
    const tick = () => {
      const begin = performance.now();
      let promise = Promise.resolve();
      promise = promise.then(() => this.world.update())
      promise = promise.then(() => new Promise((ok) => {
        const wait = this.delay - (performance.now() - begin);
        wait > 0 ? setTimeout(ok, wait) : ok()
      }));
      if (this.started) promise = promise.then(tick)
    }
    return tick();
  }

  public stop() {
    this.started = false;
  }

  *[Symbol.asyncIterator]() {
    while (this.started) {
      const begin = performance.now();
      let promise = Promise.resolve();
      promise = promise.then(() => this.world.update())
      promise = promise.then(() => new Promise((ok) => {
        const wait = this.delay - (performance.now() - begin);
        wait > 0 ? setTimeout(ok, wait) : ok()
      }));
      yield promise.then(() => begin);
    }
  }
}
export default Life;