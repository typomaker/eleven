import * as game from "..";
import * as ecs from "../../ecs";
import Logger from "../../logger";

export class Debug extends ecs.System<game.Entity> {
  private last = 0;
  private counter = 0;
  private readonly every = 10;
  constructor(private readonly world: game.World) {
    super()
  }

  public async updated(tick: ecs.World.Tick) {
    const current = tick.time.current / 1000;
    this.counter++;
    if (current > this.last) {
      Logger.debug("fps", { fps: this.counter / this.every, delay: this.world.delay, tick })
      this.last = Math.ceil(current) + this.every;
      this.counter = 0;
    }
  }
}


export default Debug