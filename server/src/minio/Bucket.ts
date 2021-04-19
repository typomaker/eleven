import * as uuid from "uuid";
import client from "./client";

export class Bucket {
  constructor(private readonly name: string) { }
  async upload(data: string) {
    const [type, base64] = data.replace("data:", "").split(";base64,")
    const buffer = Buffer.from(base64, "base64");
    const filename = uuid.v4() + "." + type.split("/")[1];
    await client.putObject(this.name, filename, buffer, Buffer.byteLength(buffer), {
      "Content-Type": type
    })
    return filename;
  }
}

export default Bucket;