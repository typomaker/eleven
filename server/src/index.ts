import * as app from "./app";
import env from "./utility/env";

app.Process.new({
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
  },
  minio: {
    accessKey: env.string('MINIO_ACCESS_KEY'),
    secretKey: env.string('MINIO_SECRET_KEY'),
    endPoint: 'minio',
    useSSL: false,
    port: 9000
  },
  session: {
    ttl: env.integer('SESSION_TTL', 600000)
  },
  nats: {
    servers: 'nats://nats:4222',
    token: env.string('NATS_TOKEN'),
    timeout: 120000,
  }
}).catch((err) => console.error(err));

