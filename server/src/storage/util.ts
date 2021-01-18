import * as mongodb from "mongodb";
import * as uuidlib from "uuid";

export namespace uuid {
  export function parse(v: string) {
    return new mongodb.Binary(Buffer.from(uuidlib.parse(v) as Uint8Array), 4)
  }
  export function stringify(v: mongodb.Binary) {
    return uuidlib.stringify(v.buffer)
  }
}
