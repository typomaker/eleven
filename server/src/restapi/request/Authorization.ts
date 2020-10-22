import * as uuid from "uuid";
import validator from "validator";
export type Authorization = string;
export namespace Authorization {
  export function is(raw: any): raw is Authorization {
    return raw && validator.isUUID(raw) && raw !== uuid.NIL;
  }
}
export default Authorization;