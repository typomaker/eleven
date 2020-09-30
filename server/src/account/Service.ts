import axios from "axios";
import Container from "../app/Container";
import Email from "./Email";
import Password from "./Password";
import Sign from "./Sign";
import Token from "./Token";
import User from "./User";

type Signin = (
  & { ip?: string }
  & (
    | { type: "facebook", token: string }
    | { type: "password", password: string, recaptcha2: string, email: string }
  )
)
export class Service {
  public readonly password = new Password(this.app.config.password)
  constructor(private readonly app: Container) { }

  private async recaptcha(token: string) {
    try {
      this.app.logger.info("[Recatpcha2]", token);
      await this.app.recaptcha2.validate(token);
    } catch (e) {
      this.app.logger.debug("[Recaptcha2]", this.app.recaptcha2.translateErrors(e));
      throw new Service.Exception("CaptchaInvalid");
    }
  }

  public async signin(value: Signin): Promise<Token> {
    let token: Token;

    switch (value.type) {
      case "password": {
        this.recaptcha(value.recaptcha2)
        let user = await this.app.storage.account.user.finder.filter(["=", "emails", ["=", "address", value.email]]).one();
        if (!user) {
          user = new User({ name: value.email.split("@")[0] });
          user.emails.push(new Email({ address: value.email, user }))
          user.signs.push(new Sign({ type: "password", data: await this.password.hash(value.password), user }))
        }
        const sign = user.signs.find((sign) => sign.type === "password");
        if (!sign) throw new Service.Exception("SignNotExist");
        if (!await this.password.compare(value.password, sign.data)) throw new Service.Exception("InvalidPassword");

        await this.app.storage.account.user.save(user);
        token = new Token({ user: sign.user, sign, ip: value.ip });
        break;
      }
      case "facebook": {
        const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: value.token, fields: "id,email,name" } });
        let user = await this.app.storage.account.user.finder.filter(["=", "signs", ["&", [["=", "type", "facebook"], ["=", "data", fb.data.id]]]]).one();
        if (!user) {
          user = new User({ name: fb.data.name || fb.data.email?.split("@")[0] });
          if (fb.data.email) {
            user = (await this.app.storage.account.user.finder.filter(["=", "emails", ["=", "address", fb.data.email]]).one()) ?? user;
          }
        }

        let email = user.emails.find((email) => email.address === fb.data.email);
        if (fb.data.email && !email) {
          email = new Email({ address: fb.data.email, confirmed: new Date(), user })
          user.emails.push(email);
        }
        if (email?.isConfirmed === false) throw new Service.Exception("EmailUnconfirmed");

        let sign = user.signs.find((sign) => sign.type === "facebook" && sign.data === fb.data.id);
        if (!sign) {
          sign = new Sign({ type: "facebook", user, data: fb.data.id });
          user.signs.push(sign);
        }

        await this.app.storage.account.user.save(user);
        token = new Token({ user, sign, ip: value.ip });
        break;
      }
      default: throw new Service.Exception("Invalid");
    }

    await this.app.storage.account.token.save(token);
    return token;
  }

  public async signout(value: { id: string }): Promise<Token> {
    const token = await this.app.storage.account.token.finder.filter(["=", "id", value.id]).one();
    if (!token) throw new Service.Exception("NotExist");
    await this.app.storage.account.token.delete(token);
    return token;
  }

  public async authorize(value: { id: string }): Promise<Token> {
    let token = await this.app.storage.account.token.finder.filter(["=", "id", value.id]).one();
    if (!token) throw new Service.Exception("NotExist");
    if (token.isExpired) {
      if (!token.isDeleted) await this.app.storage.account.token.delete(token);
      throw new Service.Exception("Expired");
    }
    if (token.isDeleted) {
      token = new Token({ user: token.user, ip: token.ip });
      await this.app.storage.account.token.save(token);
    }
    return token;
  }

}
export namespace Service {
  export class Exception extends Error { }
}

export default Service;
