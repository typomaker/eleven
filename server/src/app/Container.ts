import http from "http";
import mongodb from "mongodb";
import pg from "pg";
import Recaptcha2 from "recaptcha2";
import * as account from "../account";
import * as game from "../game";
import * as restapi from "../restapi";
import Storage from "../storage";
import * as wsapi from "../wsapi";
import Configuration from "./Configuration";
import Logger from "./Logger";

export class Container {

  public readonly server = http.createServer();
  public readonly logger = new Logger(this.config.env === "development").wrap(this.config.env, `pid:${process.pid}`);
  public readonly recaptcha2 = new Recaptcha2(this.config.recaptcha2);
  public readonly pg = new pg.Pool(this.config.pg)
  public readonly storage = new Storage(this.pg)
  public readonly account = new account.Service(this);
  public readonly wsapi = new wsapi.Server(this);
  public readonly restapi = new restapi.Server(this);
  public readonly mongodb = new mongodb.MongoClient(this.config.mongodb.uri, { useUnifiedTopology: true })
  public readonly game = new game.Service(this);

  constructor(public readonly config: Configuration) {
    this.pg.on("error", (err) => this.logger.error("Unexpected error on idle client", err))
  }

  public async load() {
    this.logger.info("started...")

    this.game.life.start()
    this.server.listen(80)

    this.logger.info("ready")
  }
}
export default Container;
