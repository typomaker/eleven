import { MongoClient as Client } from "mongodb";
import { mongo } from "../env";
export const client = new Client(mongo.toString(), { connectTimeoutMS: 120000 })

await client.connect();

export default client;
