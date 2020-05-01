import express from "express";
import * as http from "http";
import WebSocket from "ws";
import * as entity from "../entity";
import IoC from "./IoC";
import Logger from "./Logger";

export class Api {

  constructor(private readonly ioc: IoC) { }

  public readonly http = new class {
    public readonly app: express.Express;
    public readonly server: http.Server;
    private readonly router: express.Router;

    constructor(private readonly api: Api) {
      this.app = express();
      this.server = http.createServer(this.app);
      this.router = express.Router({ strict: true });
      this.app.use(this.router);

      this.router.post("/token", this.createToken.bind(this));
      this.router.get("/token", this.getToken.bind(this));
      this.router.delete("/token", this.deleteToken.bind(this));
    }

    private createToken(req: express.Request, res: express.Response) {
      res.send('Hello');
    }
    private getToken(req: express.Request, res: express.Response) {
      res.send('Hello');
    }
    private deleteToken(req: express.Request, res: express.Response) {
      res.send('Hello');
    }
  }(this)

  public readonly ws = new class WS {
    public readonly server: WebSocket.Server;
    private logger: Logger;
    private pool = new Map<entity.account.User["id"], Set<WebSocket>>()
    constructor(private readonly api: Api) {
      this.logger = this.api.ioc.logger.tag("WebSocket");
      this.server = new WebSocket.Server({ server: this.api.http.server });

      this.server.on("connection", (ws, req) => new WS.Connection(this.api, ws, req));
      this.server.on("close", this.close.bind(this));
      this.server.on("error", this.error.bind(this));
    }
    private error(err: Error) {
      this.logger.info("error", err);
    }
    private close() {
      this.logger.info("close");
    }
    private static readonly Connection = class Connection {
      private logger: Logger;
      constructor(private readonly api: Api, private readonly ws: WebSocket, private readonly req: http.IncomingMessage) {
        this.logger = this.api.ws.logger.tag("Connection");

        this.ws.on("open", this.open.bind(this));
        this.ws.on("message", this.message.bind(this));
        this.ws.on("close", this.close.bind(this));
        this.ws.on("error", this.error.bind(this));
      }
      private error(err: Error) {
        this.logger.info("error", err)
      }
      private open() {
        this.logger.info("open");
      }
      private close() {
        this.logger.info("close");
      }
      private message(data: WebSocket.Data) {
        this.logger.info("data", data);
      }
    }

  }(this)

  public listen(port = 80) {
    this.http.server.listen(port);
  }
}