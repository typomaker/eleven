import http from 'http';
import ws from 'ws';
import * as account from '../account';
import * as app from '../app';
import { Logger } from '../app';
import * as ecsq from '../ecsq';
import Entity from './Entity';
import World from './World';
export class WebSocket extends ecsq.System<Entity> {
  private readonly logger: Logger;
  public readonly server = new ws.Server({ noServer: true });
  private readonly account = new Map<string, account.entity.User>();
  public readonly query = {
    state: new ecsq.Query<Entity>((id, entity) => {
      return entity?.state !== undefined;
    })
  }

  constructor(public readonly app: app.Container) {
    super();
    this.logger = app.logger.wrap(WebSocket.name);
  }

  public enabled(world: World) {
    this.server.on("connection", this.connection.bind(this, world));
    this.server.on("close", () => this.logger.debug("closed"));
    this.server.on("error", (err) => this.logger.error(err));
    return super.enabled(world);
  }

  private connection(world: World, ws: ws, req: http.IncomingMessage, session: account.entity.Session) {
    const logger = this.logger.wrap(req.socket.remoteAddress ?? '?:?:?:?', session.id, session.user.id)

    ws.on('ping', () => logger.debug('ping'))
    ws.on('pong', () => logger.debug('pong'))
    ws.on('error', (err) => logger.error(err))
    ws.on('close', (code, reason) => logger.info('closed', code, reason))
    ws.on('message', this.message.bind(this, world, logger, session, ws))
  }

  private message(world: World, logger: Logger, session: account.entity.Session, ws: ws, data: ws.Data) {
    try {
      logger.debug('received message', data);
      const message: Entity = JSON.parse(data.toString());
      message.account = { uuid: session.user.id };
      ws.send(JSON.stringify(message))
    } catch (e) {
      logger.error(e)
    }
  }

  public disabled(world: World) {
    for (const client of this.server.clients) {
      client.removeAllListeners();
      client.close(4002);
    }
    this.server.removeAllListeners();
    return super.disabled(world);
  }
}
export default WebSocket;