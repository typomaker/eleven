import * as minio from "minio";
import mongodb from "mongodb";
import * as nats from "nats";
import Recaptcha2 from "recaptcha2";
import * as account from "../account";
import * as game from "../game";
import * as net from '../net';
import * as restapi from "../restapi";
// import * as wsapi from "../wsapi";
import Asset from "./Asset";
import Configuration from "./Configuration";
import Logger from "./Logger";
import Password from "./Password";
export class Container {

  public readonly logger = new Logger(this.config.env === "development").wrap(this.config.env, `pid:${process.pid}`);
  public readonly server = new net.Server(this);
  public readonly recaptcha2 = new Recaptcha2(this.config.recaptcha2);
  public readonly password = new Password(this.config.password);
  public readonly mongodb = new mongodb.MongoClient(this.config.mongodb.uri, { useUnifiedTopology: true, connectTimeoutMS: 120000 })
  public readonly minio = new minio.Client(this.config.minio)

  public readonly asset = new Asset(this);
  public readonly account = new account.Service(this);
  // public readonly wsapi = new wsapi.Service(this);
  public readonly restapi = new restapi.Service(this);

  public readonly game = new game.World(this);

  private constructor(public readonly config: Configuration) {
  }

  public static async new(config: Configuration) {
    const container = new this(config);
    await container.logger.info("started...");
    await container.mongodb.connect();
    container.#nats = await nats.connect(container.config.nats);
    await container.server.listen(container.config.port);
    await container.game.start();
  }

  #nats?: nats.NatsConnection
  public get nats() {
    return this.#nats!
  }

}
export default Container;
