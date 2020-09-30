import WS from "ws";
import Container from "../app/Container";

export class Server {
  public readonly ws: WS.Server;
  private logger = this.app.logger.wrap("wsapi")
  constructor(private readonly app: Container) {
    this.ws = new WS.Server({ server: app.server });

    this.ws.on("connection", (ws, req) => {
      this.logger.debug("connection", ws.readyState)
      ws.on("open", () => this.logger.debug("connection:open"));
      ws.on("message", (m) => this.logger.debug("connection:message", m));
      ws.on("close", () => this.logger.debug("connection:close"));
      ws.on("error", () => this.logger.debug("connection:error"));
    });
    this.ws.on("close", () => this.logger.debug("close"));
    this.ws.on("error", (err) => this.logger.debug("error", err));

  }
}

export default Server