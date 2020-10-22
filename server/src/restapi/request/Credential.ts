import validator from "validator";

export type Credential = (
  | { type: "fb", token: string }
  | { type: "pw", password: string, recaptcha2: string, email: string, name: string }
)
export namespace Credential {
  export function is(raw: any): raw is Credential {
    return (
      (
        raw?.type === "fb"
        && !validator.isEmpty(raw?.token ?? '')
      )
      ||
      (
        raw?.type === "pw"
        && typeof raw?.email === "string" && validator.isEmail(raw?.email ?? '')
        && typeof raw?.password === "string" && !validator.isEmpty(raw?.password ?? '')
        && typeof raw?.recaptcha2 === "string" && !validator.isEmpty(raw?.recaptcha2 ?? '')
      )
    )
  }
}
export default Credential;