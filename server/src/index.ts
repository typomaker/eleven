import Application from "./service/Application";
import env from "./utility/env";

const app = new Application.Cluster({
  env: (process.env.ENV as any) || "production",
  domain: env.string("DOMAIN"),
  password: {
    rounds: env.integer("PASSWORD_ROUNDS", 15),
    salt: env.string("PASSWORD_SALT")
  },
  pg: {
    database: env.string("POSTGRES_USER", "postgres"),
    host: env.string("POSTGRES_HOST", "postgres"),
    password: env.string("POSTGRES_PASSWORD", "postgres"),
    user: env.string("POSTGRES_USER", "postgres"),
  },
  recaptcha2: {
    siteKey: env.string("RECAPTHCA2_APP_ID"),
    secretKey: env.string("RECAPTHCA2_SECRET"),
  },
  mongodb: {
    uri: `mongodb://${env.string("MONGO_INITDB_ROOT_USERNAME")}:${env.string("MONGO_INITDB_ROOT_PASSWORD")}@mongodb:27017`,
  }
});
app.start().catch((err) => console.error(err));

