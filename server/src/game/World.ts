import * as account from "../account";
import * as ecs from "../ecs";
import * as env from "../env";
import Entity from "./Entity";
import * as system from "./system";

export class World extends ecs.World<Entity> {
  public readonly user = new Map<account.entity.User["uuid"], account.entity.User>()
  public readonly entity = new Map<Entity["id"], Entity>()
  public readonly websocket = new system.WebSocket(this);
  public readonly command = new system.Command(this);
  public readonly debug = new system.Debug(this);


  constructor() {
    super(1000 / env.game.frameRate)
    this.attach(this.debug);
    this.attach(this.websocket);
    this.attach(this.command);
  }
}

export default World