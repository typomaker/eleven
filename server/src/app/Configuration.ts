import minio from "minio";
import * as nats from "nats";
import pg from "pg";
import Recaptcha2 from "recaptcha2";
import Password from "./Password";
export interface Configuration {
  env: "development" | "production"
  domain: string;
  password: Password.Configuration;
  pg: pg.PoolConfig;
  recaptcha2: Recaptcha2.Options;
  mongodb: {
    uri: string
  }
  minio: minio.ClientOptions,
  session: {
    ttl: number
  }
  nats: nats.ConnectionOptions
}
export default Configuration