import logger from "./logger";
import process from "./process";

process().catch((err) => logger.error(err))

