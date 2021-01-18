import * as http from 'http';
import net from 'net';
import { URL } from 'url';
import { Logger } from '../app';
import Container from '../app/Container';

export class Server extends http.Server {
  private readonly logger: Logger;

  constructor(private readonly app: Container) {
    super();
    this.logger = app.logger.wrap(Server.name);
    this.on('upgrade', this.upgrade.bind(this));
  }

  private async upgrade(request: http.IncomingMessage, socket: net.Socket, head: any) {
    const url = new URL(request.url ?? '', 'https://' + this.app.config.domain);
    this.logger.debug(`upgrading ${url.pathname}`);
    try {
      const token = url.searchParams.get('token');
      if (!token) throw new Error('empty token');
      const session = await this.app.account.authorize(token);
      switch (url.pathname) {
        case '/game': {
          this.app.game.websocket.server.handleUpgrade(request, socket, head, (ws) => {
            this.app.game.websocket.server.emit('connection', ws, request, session);
          });
          break;
        }
        default: throw new Error(`unexpected pathname ${url.pathname}`);
      }
    } catch (e) {
      this.logger.info('upgrading failed', e)
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
  }
}
export namespace Server {

}

export default Server;