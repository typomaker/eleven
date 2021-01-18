import * as mongodblib from "mongodb";
import * as uuidlib from "uuid";

export namespace uuid {
  export function parse(v: string) {
    return new mongodblib.Binary(Buffer.from(uuidlib.parse(v) as Uint8Array), 4)
  }
  export function stringify(v: mongodblib.Binary) {
    return uuidlib.stringify(v.buffer);
  }
}