import http from "http";
import net from "net";
import { URL } from "url";
import * as account from "../account";
import { domain, port } from "../env";
import * as game from "../game";
import logger from "../logger";
import restapi from "../restapi";

const server = new http.Server(restapi);
server.on("upgrade", upgrade.bind(this));
server.on("error", (err) => logger.error(err))

async function upgrade(request: http.IncomingMessage, socket: net.Socket, head: any) {
  const url = new URL(request.url ?? "", "https://" + domain);
  logger.debug(`upgrading ${request.url}`);
  try {
    const token = url.searchParams.get("token");
    if (!token) throw new Error("empty token");
    const session = await account.authorize(token);
    switch (url.pathname) {
      case "/game": return game.world.websocket.upgrade(request, socket, head, session);
      default: throw new Error(`unexpected pathname ${url.pathname}`);
    }
  } catch (error) {
    logger.error("upgrading failed", error)
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
}


export function listen() {
  server.listen(port)
  logger.debug(`server listening :${port}`)
}

export default listen;