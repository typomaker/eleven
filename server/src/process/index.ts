import cluster from "cluster";
import os from "os";
import * as cfg from "../env";
import logger from "../logger";
import server from "../server";


function fork() {
  logger.info("master cluster setting up", { workers: os.cpus().length });
  for (const _ of os.cpus()) {
    cluster.fork();
  }

  cluster.on("online", (worker) => {
    logger.info("worker online", { pid: worker.process.pid });
  });

  cluster.on("exit", (worker, code, signal) => {

    if (code) {
      logger.warning("worker exited", { pid: worker.process.pid, code, signal });
    } else {
      logger.info("worker stopped", { pid: worker.process.pid, code, signal });
    }

    const successor = cluster.fork();
    logger.info(`started a new worker instead ${worker.process.pid}`, { pid: successor.process.pid });
  })
}

export async function start() {
  if (cfg.env !== "development" && cluster.isMaster) {
    fork()
  } else {
    logger.debug("started")
    server()
  }
}

export default start;