import http from "http";
import net from "net";
import Ws from "ws";
import * as account from "../../account";
import * as ecs from "../../ecs";
import Logger from "../../logger";
import Entity from "../Entity";
import World from "../World";

enum Code {
  ServerStopped = 4002,
  PlayerNotExists = 4003,
}

export class WebSocket extends ecs.System<Entity> {
  public readonly server = new Ws.Server({ noServer: true });
  private readonly ws = new Map<account.entity.User["uuid"], Ws>()

  constructor(protected readonly world: World) {
    super()
  }

  public async attached() {
    this.server.on("connection", this.connection.bind(this));
    this.server.on("close", (...args) => Logger.debug("closed", { args }));
    this.server.on("error", (err) => Logger.error(err));
  }

  public async detached() {
    for (const client of this.server.clients) {
      client.removeAllListeners();
      client.close(Code.ServerStopped);
    }
    this.server.removeAllListeners();
  }

  public async updated() {
    for (const entity of this.consumed) {
      if (!entity.user) continue;
      if (!this.ws.has(entity.user)) continue;
      this.ws.get(entity.user)!.send(JSON.stringify(entity))
    }
  }

  public upgrade(request: http.IncomingMessage, socket: net.Socket, head: Buffer, session: account.entity.Session) {
    this.server.handleUpgrade(request, socket, head, (ws) => {
      this.server.emit("connection", ws, request, session);
    });
  }

  private async connection(ws: Ws, req: http.IncomingMessage, session: account.entity.Session) {
    Logger.debug("connection", { session })

    const log = Logger.with({
      remoteAddr: req.socket.remoteAddress ?? "?:?:?:?",
      session: session.uuid,
      user: session.user,
    })

    ws.on("ping", () => log.debug("ping"))
    ws.on("pong", () => log.debug("pong"))
    ws.on("error", (err) => log.error(err))
    ws.on("close", this.close.bind(this, log, session, ws))
    ws.on("message", this.message.bind(this, log, session, ws))

    try {
      this.ws.set(session.user, ws)
      const user = await account.repository.user.find().uuid(session.user).read().one()
      if (!user) throw new Error(`user '${session.user}' not exists`);
      this.world.user.set(session.user, user)
      log.info(`player '${session.user}' is started`, { session })
    } catch (e) {
      log.error(e);
      ws.close(Code.PlayerNotExists)
    }
  }

  private message(log: Logger, session: account.entity.Session, ws: Ws, data: Ws.Data) {
    try {
      log.debug(`got message from client`, { data });
      const message: Entity = JSON.parse(data.toString());
      message.user = session.user
      this.produced.add(message)
    } catch (e) {
      log.error(e)
    }
  }

  private async close(log: Logger, session: account.entity.Session, ws: Ws, code: number, reason: string) {
    log.info(`player '${session.user}' is connection closed`, { code, reason, session })
    this.ws.delete(session.user)
    this.world.user.delete(session.user)
    log.info(`player '${session.user}' is exited`, { session })
  }

}

export default WebSocket;