import * as app from "../app";
import * as ecsq from '../ecsq';
import Entity from "./Entity";
import WebSocket from "./WebSocket";

export class World extends ecsq.World<Entity> {
  public readonly websocket = new WebSocket(this.app);

  constructor(public readonly app: app.Container) {
    super(1000 / app.config.game.frameRate);
    this.enable(this.websocket);
  }
}

export default World;