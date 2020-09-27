import cluster from "cluster";
import http from "http";
import mongodb from "mongodb";
import os from "os";
import pg from "pg";
import Recaptcha2 from "recaptcha2";
import * as service from ".";
import * as ecs from "../ecs";
import * as restapi from "../restapi";
import Storage from "../storage";
import * as wsapi from "../wsapi";
import Logger from "./Logger";
import Password from "./Password";

class Application {

  public readonly server = http.createServer();
  public readonly logger = new Logger(this.config.env === "development").wrap(this.config.env, `pid:${process.pid}`);
  public readonly recaptcha2 = new Recaptcha2(this.config.recaptcha2);
  public readonly password = new service.Password(this.config.password);
  public readonly pg = new pg.Pool(this.config.pg)
  public readonly storage = new Storage(this.pg)
  public readonly account = new service.Account(this);
  public readonly wsapi = new wsapi.Server(this);
  public readonly restapi = new restapi.Server(this);
  public readonly mongodb = new mongodb.MongoClient(this.config.mongodb.uri, { useUnifiedTopology: true })
  public readonly world = new ecs.World();
  public readonly life = new ecs.Life(1000 / 30, this.world);

  constructor(public readonly config: Application.Configuration) {
    this.pg.on("error", (err) => this.logger.error("Unexpected error on idle client", err))
  }


  public async start() {
    this.logger.info("started...")
    await this.mongodb.connect();
    this.life.start()
    this.server.listen(80)
    this.logger.info("ready")
  }
}
namespace Application {
  export interface Configuration {
    env: "development" | "production"
    domain: string;
    password: Password.Configuration;
    pg: pg.PoolConfig;
    recaptcha2: Recaptcha2.Options;
    mongodb: {
      uri: string
    }
  }
  export namespace Configuration {
    export const isDevelopment = (c: Configuration) => c.env === "development"
  }

  export class Cluster {
    private readonly logger = new Logger(this.config.env === "development").wrap(this.config.env, `pid:${process.pid}`, 'cluster');
    constructor(private readonly config: Configuration) { }

    private fork() {
      this.logger.info('master cluster setting up', { workers: os.cpus().length });
      for (const _ of os.cpus()) {
        cluster.fork();
      }

      cluster.on('online', (worker) => {
        this.logger.info('worker online', { pid: worker.process.pid });
      });

      cluster.on('exit', (worker, code, signal) => {
        const message = ['worker stopped', { pid: worker.process.pid, code, signal }]
        if (code) {
          this.logger.warning(...message);
        } else {
          this.logger.info(...message);
        }

        this.logger.info(`starting a new worker instead ${worker.process.pid}`);
        cluster.fork();
      });
    }

    public async start() {
      if (this.config.env !== "development" && cluster.isMaster) {
        this.fork()
      } else {
        return new Application(this.config).start();
      }
    }
  }
}
export default Application;
