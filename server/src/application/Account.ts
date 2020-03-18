import axios from "axios";
import * as entity from "../entity/account";
import Container from "./Container";

class Account {
  constructor(private readonly container: Container) { }
  public async signin(
    value: { ip?: string } & (
      | { type: "facebook", token: string }
      | { type: "password", password: string, recaptcha2: string, email: string }
    ),
  ): Promise<entity.Token> {
    let token: entity.Token;
    switch (value.type) {
      case "password": {
        try {
          this.container.logger.info("[Recatpcha2]", value.recaptcha2);
          await this.container.recaptcha2.validate(value.recaptcha2);
        } catch (e) {
          this.container.logger.debug("[Recaptcha2]", this.container.recaptcha2.translateErrors(e));
          throw new Account.Error("CaptchaInvalid");
        }
        let email = await this.container.storage.account.email.read().address(value.email).one();
        let sign: entity.Sign | null;
        if (!email) {
          const owner = new entity.User({ name: value.email.split("@")[0] });
          await this.container.storage.account.user.save(owner);
          email = new entity.Email({ address: value.email, owner });
          await this.container.storage.account.email.save(email);
          sign = new entity.Sign({ type: "password", data: await this.container.password.hash(value.password), owner });
          await this.container.storage.account.sign.save(sign);
        } else {
          sign = await this.container.storage.account.sign.read().type("password").owner(email.owner).one();
          if (!sign) throw new Account.Error("SignNotExist");
          if (!await this.container.password.compare(value.password, sign.data)) throw new Account.Error("InvalidPassword");
        }
        token = new entity.Token({ owner: sign.owner, sign, ip: value.ip });
        break;
      }
      case "facebook": {
        const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: value.token, fields: "id,email,name" } });
        let sign = await this.container.storage.account.sign.read().type("facebook").data(fb.data.id).one();
        if (!sign) {
          if (fb.data.email) {
            let email = await this.container.storage.account.email.read().address(fb.data.email).one();
            if (!email) {
              const name = fb.data.name || fb.data.email?.split("@")[0];
              const owner = new entity.User({ name });
              await this.container.storage.account.user.save(owner);
              email = new entity.Email({ address: fb.data.email, confirmed: new Date(), owner });
              await this.container.storage.account.email.save(email);
            }
            if (!email.isConfirmed) throw new Account.Error("EmailUnconfirmed");
            sign = new entity.Sign({ type: "facebook", owner: email.owner, data: fb.data.id });
          } else {
            const owner = new entity.User({ name: fb.data.name });
            await this.container.storage.account.user.save(owner);
            sign = new entity.Sign({ type: "facebook", owner, data: fb.data.id });
          }
        } else {
          if (fb.data.email) {
            let email = await this.container.storage.account.email.read().address(fb.data.email).one();
            if (!email) {
              email = new entity.Email({ address: fb.data.email, confirmed: new Date(), owner: sign.owner });
              await this.container.storage.account.email.save(email);
            }
          }
        }
        await this.container.storage.account.sign.save(sign);
        token = new entity.Token({ owner: sign.owner, sign, ip: value.ip });
        break;
      }
    }

    await this.container.storage.account.token.save(token);
    return token;
  }
  public async signout(value: { id: string }): Promise<entity.Token> {
    const token = await this.container.storage.account.token.get(value.id);
    if (!token) throw new Account.Error("NotExist");
    await this.container.storage.account.token.delete(token);
    return token;
  }
  public async authorize(value: { id: string }): Promise<entity.Token> {
    let token = await this.container.storage.account.token.get(value.id);
    if (!token) throw new Account.Error("NotExist");
    if (token.isExpired) {
      if (!token.isDeleted) await this.container.storage.account.token.delete(token);
      throw new Account.Error("Expired");
    }
    if (token.isDeleted) {
      token = new entity.Token({ owner: token.owner, ip: token.ip });
      await this.container.storage.account.token.save(token);
    }
    return token;
  }

}
const BaseError = Error;
namespace Account {
  export class Error extends BaseError { }
}

export default Account;
