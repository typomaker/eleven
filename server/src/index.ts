// import rest from "./rest";

import Application from "./application";
import env from "./utility/env";

const app = new Application({
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
});

app.wsocket.start();
