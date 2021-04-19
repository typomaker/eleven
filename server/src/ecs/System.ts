import World from "./World";

export abstract class System<T extends object> {
  public readonly produced = new Set<T>();
  public readonly consumed = new Set<T>();

  public async attached(tick: World.Tick): Promise<any> {
    return
  }
  public async started(tick: World.Tick): Promise<any> {
    return
  }
  public async updated(tick: World.Tick): Promise<any> {
    return
  }
  public async stoped(tick: World.Tick): Promise<any> {
    return
  }
  public async detached(tick: World.Tick): Promise<any> {
    return
  }
}
export namespace System {
  export class Composite<T extends object> extends System<T> {
    public readonly pool = new Array<System<T>>();

    constructor(...system: Array<System<T>>) {
      super()
      this.pool = system;
    }
    public async started(tick: World.Tick): Promise<any> {
      await Promise.all(this.pool.map((it) => it.started(tick)));
    }
    public async stoped(tick: World.Tick): Promise<any> {
      await Promise.all(this.pool.map((it) => it.stoped(tick)));
    }
    public async attached(tick: World.Tick): Promise<any> {
      await Promise.all(this.pool.map((it) => it.attached(tick)));
    }
    public async detached(tick: World.Tick): Promise<any> {
      await Promise.all(this.pool.map((it) => it.detached(tick)));
    }
    public async updated(tick: World.Tick): Promise<any> {
      await Promise.all(this.pool.map((it) => it.updated(tick)));
    }
  }
}
export default System;