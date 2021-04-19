export abstract class Error extends globalThis.Error { }
export namespace Error {
  export class Captcha extends Error { constructor(message: string) { super(`${Captcha.name} : ${message}`) } }
  export class ShouldBeAnotherSign extends Error { constructor() { super(ShouldBeAnotherSign.name) } }
  export class SignNotFound extends Error { constructor() { super(SignNotFound.name) } }
  export class TokenInvalid extends Error { constructor() { super(TokenInvalid.name) } }
  export class TokenExpired extends Error { constructor() { super(TokenExpired.name) } }
  export class TokenConflict extends Error { constructor() { super(TokenConflict.name) } }
  export class TokenNotFound extends Error { constructor() { super(TokenNotFound.name) } }
  export class PasswordInvalid extends Error { constructor() { super(PasswordInvalid.name) } }
  export class EmailNotConfirmed extends Error { constructor() { super(EmailNotConfirmed.name) } }
  export class UserNotFound extends Error { constructor() { super(UserNotFound.name) } }
}
export default Error;