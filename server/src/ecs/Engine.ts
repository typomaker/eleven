import State from "./State";



export class Engine<T extends object> {
  public readonly state: State<T>;
  private systems = new Set<Engine.System<T>>();
  private depth = 0;
  private promise?: Promise<any>;

  constructor(state?: State<T>) {
    this.state = state ?? new State<T>();
  }

  public register(system: Engine.System<T>) {
    this.systems.add(system);
  }

  public unregister(system: Engine.System<T>) {
    this.systems.delete(system);
  }

  public update() {
    this.depth++;
    if (!this.promise) this.promise = Promise.resolve();
    for (const system of this.systems) {
      this.promise = this.promise.then(() => system(this.state))
    }
    this.depth--;
    if (this.depth === 0) {
      this.promise.then(() => this.promise = undefined)
    }
  }
}
export namespace Engine {
  export type System<T extends object> = (state: State<T>) => void
}

export default Engine;
