import cluster from "cluster";
import os from "os";
import { Container } from ".";
import Configuration from "./Configuration";
import Logger from "./Logger";

export class Process {
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
      return new Container(this.config).load();
    }
  }
}

export default Process