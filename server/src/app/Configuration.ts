import pg from "pg";
import Recaptcha2 from "recaptcha2";
import Password from "../account/Password";

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
export default Configuration