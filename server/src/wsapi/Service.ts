// import querstring from 'querystring';
// import WS from "ws";
// import * as account from "../account";
// import Container from "../app/Container";

// export class Service {
//   private readonly character = new Map<string, WS>()

//   public readonly ws: WS.Server;
//   public logger = this.app.logger.wrap("wsapi")
//   constructor(public readonly app: Container) {
//     this.ws = new WS.Server({ server: app.server });
//     this.ws.on("connection", async (ws, req) => {
//       const logger = this.logger.wrap('ws', req.connection.remoteAddress ?? 'unknown')

//       let session: account.entity.Session
//       try {
//         const token = querstring.parse((req.url ?? '').replace('/?', '')).token as string;
//         session = await this.app.account.authorize(token);
//       } catch (e) {
//         logger.info('authorize failed', e)
//         return ws.close(4001)
//       }

//       const player = this.app.game.play(session);

//       ws.on('ping', () => {
//         logger.debug('ping');
//       })
//       ws.on('pong', () => {
//         logger.debug('pong');
//       })
//       ws.on('error', (err) => {
//         logger.error(err)
//       })
//       ws.on('close', (code, reason) => {
//         logger.info('closed', code, reason)
//       })
//       ws.on('message', async (data) => {
//         try {
//           logger.debug('received message', data);
//           const message = JSON.parse(data.toString())
//           const result = player.command(message);
//           if (result) ws.send(JSON.stringify(result))
//         } catch (e) {
//           logger.error(e)
//         }
//       })
//     });
//     this.ws.on("close", () => this.logger.debug("closed"));
//     this.ws.on("error", (err) => this.logger.debug(err));
//   }
// }

// export default Service