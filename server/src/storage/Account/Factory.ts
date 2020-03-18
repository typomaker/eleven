import Context from "../Context";
import Email from "./Email";
import Sign from "./Sign";
import Token from "./Token";
import User from "./User";
export class Factory {
  constructor(private readonly context: Context) { }

  #user?: User;
  public get user() {
    return this.#user ?? (this.#user = new User(this.context));
  }
  #email?: Email;
  public get email() {
    return this.#email ?? (this.#email = new Email(this.context));
  }
  #sign?: Sign;
  public get sign() {
    return this.#sign ?? (this.#sign = new Sign(this.context));
  }
  #token?: Token;
  public get token() {
    return this.#token ?? (this.#token = new Token(this.context));
  }
}

export default Factory;
