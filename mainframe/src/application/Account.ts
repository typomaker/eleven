import axios from "axios";
import * as entity from "../entity";
import Container from "./Container";

class Account {
  constructor(private readonly container: Container) { }
  public async signin(p: Account.Credential): Promise<entity.Token> {
    let token: entity.Token;
    switch (p.type) {
      case "password": {
        let email = await this.container.storage.email.read().address(p.email).one()
        let sign: entity.Sign | null
        if (!email) {
          const owner = new entity.Account({ name: p.email.split("@")[0] });
          await this.container.storage.account.save(owner);
          email = new entity.Email({ address: p.email, owner })
          await this.container.storage.email.save(email);
          sign = new entity.Sign({ type: "password", data: await this.container.password.hash(p.data), owner: owner });
          await this.container.storage.sign.save(sign);
        } else {
          sign = await this.container.storage.sign.read().type("password").owner(email.owner).one();
          if (!sign) throw new Account.Error("SignNotExist");
          if (!await this.container.password.compare(p.data, sign.data)) throw new Account.Error("InvalidPassword");
        }
        token = new entity.Token({ owner: sign.owner, sign, ip: p.ip });
        break;
      }
      case "facebook": {
        const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: p.data, fields: "id,email,name" } });
        let sign = await this.container.storage.sign.read().type("facebook").data(fb.data.id).one();
        if (!sign) {
          if (fb.data.email) {
            let email = await this.container.storage.email.read().address(fb.data.email).one()
            if (!email) {
              const name = fb.data.name || fb.data.email?.split("@")[0]
              const owner = new entity.Account({ name });
              await this.container.storage.account.save(owner);
              email = new entity.Email({ address: fb.data.email, confirmed: new Date(), owner: owner });
              await this.container.storage.email.save(email);
            }
            if (!email.isConfirmed) throw new Account.Error("EmailUnconfirmed");
            sign = new entity.Sign({ type: "facebook", owner: email.owner, data: fb.data.id });
          } else {
            const owner = new entity.Account({ name: fb.data.name });
            await this.container.storage.account.save(owner);
            sign = new entity.Sign({ type: "facebook", owner, data: fb.data.id });
          }
        } else {
          if (fb.data.email) {
            let email = await this.container.storage.email.read().address(fb.data.email).one()
            if (!email) {
              email = new entity.Email({ address: fb.data.email, confirmed: new Date(), owner: sign.owner });
              await this.container.storage.email.save(email);
            }
          }
        }
        await this.container.storage.sign.save(sign);
        token = new entity.Token({ owner: sign.owner, sign, ip: p.ip });
        break;
      }
    }

    await this.container.storage.token.save(token);
    return token;
  }
  public async signout(id: entity.Token["id"]): Promise<entity.Token> {
    const token = await this.container.account.authorize(id);
    if (!token) throw new Account.Error("NotExist");
    await this.container.storage.token.delete(token);

    return token;
  }
  public async authorize(id: entity.Token["id"]): Promise<entity.Token> {
    const token = await this.container.storage.token.get(id);
    if (!token) throw new Account.Error("NotExist");
    if (token.isDeleted) throw new Account.Error("Deleted");
    if (token.isExpired) {
      await this.container.storage.token.delete(token);
      throw new Account.Error("Expired");
    }
    return token;
  }
}
const BaseError = Error;
namespace Account {
  export class Error extends BaseError { }
  export type Credential = {
    type: "facebook" | "password"
    data: string
    email: string
    ip?: string
  };
  export namespace Creadential {
    export function is(v: any | Credential): v is Credential {
      if (!entity.Sign.Kind.is(v?.type)) return false;
      if (typeof v.token !== "string") return false
      if (typeof v.email !== "string") return false
      if (v.ip && typeof v.ip !== "string") return false;
      return true;
    }
  }
}

export default Account;