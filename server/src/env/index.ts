import url from "url";

function fallback<T>(value: T): NonNullable<T> {
  if (!value) throw new Error(`Required set value for '${value}' environment variable`);
  return value as NonNullable<T>;
}
function string(name: string, def?: string): string {
  if (process.env[name]) {
    return process.env[name]!;
  }
  return fallback(def);
}
function integer(name: string, def?: number): number {
  const v = parseInt(process.env[name]!, 10);
  if (Number.isNaN(v)) return fallback(def)
  return v;
}
function float(name: string, def?: number): number {
  const v = parseFloat(process.env[name]!);
  if (Number.isNaN(v)) return fallback(def)
  return v;
}

export const domain = string("DOMAIN")
export const port = integer("PORT", 80)

export type Env = "production" | "development"
export const env: Env = (process.env.ENV as Env) || "production"
if (env !== "development" && env !== "production") throw new Error("ENV must be `production`|`development`")
export default env;

export const recaptcha2 = Object.freeze({
  siteKey: string("RECAPTHCA2_APP_ID"),
  secretKey: string("RECAPTHCA2_SECRET"),
})

export const mongo = new url.URL(string("MONGO"))

export const minio = new url.URL(string("MINIO"))

export const session = Object.freeze({
  ttl: integer("SESSION_TTL", 600000)
})

export const nats = Object.freeze({
  servers: "nats://nats:4222",
  token: string("NATS_TOKEN"),
  timeout: 120000,
})
export const game = Object.freeze({
  frameRate: integer("GAME_FRAME_RATE", 60),
})
export const resapi = Object.freeze({
  cache: {
    maxAge: integer("RESTAPI_CACHE_MAX_AGE", 86400)
  }
})
