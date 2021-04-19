import * as nats from "nats";
import { nats as cfg } from "../env";
export const client = await nats.connect(cfg)
export default client;