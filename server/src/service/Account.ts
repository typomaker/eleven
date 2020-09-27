import axios from "axios";
import Email from "../account/Email";
import Sign from "../account/Sign";
import Token from "../account/Token";
import User from "../account/User";
import Application from "./Application";

type Signin = (
  & { ip?: string }
  & (
    | { type: "facebook", token: string }
    | { type: "password", password: string, recaptcha2: string, email: string }
  )
)
class Account {
  constructor(private readonly container: Application) { }

  private async recaptcha(token: string) {
    try {
      this.container.logger.info("[Recatpcha2]", token);
      await this.container.recaptcha2.validate(token);
    } catch (e) {
      this.container.logger.debug("[Recaptcha2]", this.container.recaptcha2.translateErrors(e));
      throw new Account.Exception("CaptchaInvalid");
    }
  }

  public async signin(value: Signin): Promise<Token> {
    let token: Token;

    switch (value.type) {
      case "password": {
        this.recaptcha(value.recaptcha2)
        let user = await this.container.storage.account.user.finder.filter(["=", "emails", ["=", "address", value.email]]).one();
        if (!user) {
          user = new User({ name: value.email.split("@")[0] });
          user.emails.push(new Email({ address: value.email, user }))
          user.signs.push(new Sign({ type: "password", data: await this.container.password.hash(value.password), user }))
        }
        const sign = user.signs.find((sign) => sign.type === "password");
        if (!sign) throw new Account.Exception("SignNotExist");
        if (!await this.container.password.compare(value.password, sign.data)) throw new Account.Exception("InvalidPassword");

        await this.container.storage.account.user.save(user);
        token = new Token({ user: sign.user, sign, ip: value.ip });
        break;
      }
      case "facebook": {
        const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: value.token, fields: "id,email,name" } });
        let user = await this.container.storage.account.user.finder.filter(["=", "signs", ["&", [["=", "type", "facebook"], ["=", "data", fb.data.id]]]]).one();
        if (!user) {
          user = new User({ name: fb.data.name || fb.data.email?.split("@")[0] });
          if (fb.data.email) {
            user = (await this.container.storage.account.user.finder.filter(["=", "emails", ["=", "address", fb.data.email]]).one()) ?? user;
          }
        }

        let email = user.emails.find((email) => email.address === fb.data.email);
        if (fb.data.email && !email) {
          email = new Email({ address: fb.data.email, confirmed: new Date(), user })
          user.emails.push(email);
        }
        if (email?.isConfirmed === false) throw new Account.Exception("EmailUnconfirmed");

        let sign = user.signs.find((sign) => sign.type === "facebook" && sign.data === fb.data.id);
        if (!sign) {
          sign = new Sign({ type: "facebook", user, data: fb.data.id });
          user.signs.push(sign);
        }

        await this.container.storage.account.user.save(user);
        token = new Token({ user, sign, ip: value.ip });
        break;
      }
      default: throw new Account.Exception("Invalid");
    }

    await this.container.storage.account.token.save(token);
    return token;
  }

  public async signout(value: { id: string }): Promise<Token> {
    const token = await this.container.storage.account.token.finder.filter(["=", "id", value.id]).one();
    if (!token) throw new Account.Exception("NotExist");
    await this.container.storage.account.token.delete(token);
    return token;
  }

  public async authorize(value: { id: string }): Promise<Token> {
    let token = await this.container.storage.account.token.finder.filter(["=", "id", value.id]).one();
    if (!token) throw new Account.Exception("NotExist");
    if (token.isExpired) {
      if (!token.isDeleted) await this.container.storage.account.token.delete(token);
      throw new Account.Exception("Expired");
    }
    if (token.isDeleted) {
      token = new Token({ user: token.user, ip: token.ip });
      await this.container.storage.account.token.save(token);
    }
    return token;
  }

}
namespace Account {
  export class Exception extends Error { }
}

export default Account;