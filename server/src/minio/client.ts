import { Client } from "minio";
import { minio } from "../env";

export const client = new Client({
  endPoint: minio.hostname,
  accessKey: minio.username,
  secretKey: minio.password,
  useSSL: minio.protocol === "https",
  port: minio.port ? parseInt(minio.port, 10) : undefined,
})

export default client;