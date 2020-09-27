import * as uuid from "uuid";

export type Entity = string;
export namespace Entity {
  export function generate() {
    return uuid.v4()
  }
}
export default Entity;