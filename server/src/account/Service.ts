import axios from "axios";
import * as uuid from "uuid";
import { entity } from ".";
import Container from "../app/Container";
import Repository from "./Repository";

export class Service {
  private readonly log = this.app.logger.wrap(Service.name);
  public readonly repository = new Repository(this.app.mongodb);
  public readonly user = new Map<string, entity.User>();
  public readonly session = new Map<string, entity.Session>();

  constructor(public readonly app: Container) { }

  private readonly authenticate = new class {
    constructor(private readonly self: Service) { }
    public async password(arg: { password: string, recaptcha2: string, email: string }) {
      try {
        await this.self.app.recaptcha2.validate(arg.recaptcha2);
      } catch (e) {
        throw new Service.Error.Captcha(this.self.app.recaptcha2.translateErrors(e));
      }

      let user = await this.self.repository.user.get(['=', 'email', arg.email])
      if (!user) {
        user = {
          id: uuid.v4(),
          name: arg.email.split("@")[0],
          created: new Date(),
          email: [{ address: arg.email }],
          sign: [{ type: "pw", data: await this.self.app.password.hash(arg.password) }]
        };
      }
      const sign = user.sign.find((v) => v.type === "pw");
      if (!sign) throw new Service.Error.ShouldBeAnotherSign();
      if (!await this.self.app.password.compare(arg.password, sign.data)) throw new Service.Error.InvalidPassword();

      await this.self.repository.user.save(user);
      return user;
    }

    public async facebook(arg: { token: string }) {
      const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: arg.token, fields: "id,email,name" } });
      let user = await this.self.repository.user.get(['=', 'sign', 'fb', fb.data.id])
      if (!user && fb.data.email) {
        user = await this.self.repository.user.get(['=', 'email', fb.data.email]);
      }
      if (!user) {
        user = {
          id: uuid.v4(),
          name: fb.data.name || fb.data.email?.split("@")[0],
          created: new Date(),
          email: [],
          sign: [{ type: "fb", data: fb.data.id }]
        };
      }
      let email = user.email?.find((email) => email.address === fb.data.email);
      if (fb.data.email && !email) {
        email = { address: fb.data.email, confirmed: new Date() };
        user.email.push(email)
      }
      if (!email?.confirmed) throw new Service.Error.EmailNotConfirmed();

      const sign = user.sign.find((v) => v.type === "fb" && v.data === fb.data.id);
      if (!sign) {
        user.sign.push({ type: "fb", data: fb.data.id });
      }
      await this.self.repository.user.save(user);
      return user;
    }
  }(this)

  public async signin(arg: ({ type: 'fb' } & Parameters<Service['authenticate']['facebook']>[0]) | ({ type: 'pw' } & Parameters<Service['authenticate']['password']>[0])): Promise<entity.Session> {
    let user: entity.User;
    switch (arg.type) {
      case 'fb': user = await this.authenticate.facebook(arg); break;
      case 'pw': user = await this.authenticate.password(arg); break;
    }

    for await (const session of this.repository.session.find(['&', [['=', 'user', user.id], ['=', 'expired', false]]])) {
      session.expired = new Date();
      await this.repository.session.save(session);
    }

    const expiration = new Date();
    expiration.setTime(Date.now() + this.app.config.session.ttl)
    const session: entity.Session = { user, created: new Date(), expired: expiration, id: uuid.v4() };
    await this.repository.session.save(session);
    this.session.set(session.id, session);
    this.user.set(session.user.id, session.user);
    return session;
  }

  public async signout(id: string): Promise<entity.Session> {
    const session = await this.repository.session.get(id);
    if (!session) throw new Service.Error.TokenNotFound();
    session.expired = new Date();
    this.repository.session.save(session);
    this.session.delete(session.id);
    this.user.delete(session.user.id);
    return session;
  }

  public async authorize(id: string) {
    const session = this.session.get(id) ?? await this.repository.session.get(id);
    if (!session) throw new Service.Error.TokenNotFound();
    if (session.expired.getTime() < Date.now()) {
      this.session.delete(session.id);
      this.user.delete(session.user.id);
      throw new Service.Error.TokenExpired();
    };
    const timeLeft = session.expired.getTime() - Date.now()
    if (timeLeft < this.app.config.session.ttl / 3) {
      session.expired.setTime(Date.now() + this.app.config.session.ttl)
      await this.repository.session.save(session)
      this.log.debug(`session ${id} ttl extended`)
    }
    this.session.set(session.id, session);
    this.user.set(session.user.id, session.user);
    return session;
  }
}
export namespace Service {
  export abstract class Error extends globalThis.Error { }
  export namespace Error {
    export class Captcha extends Error {
      constructor(message: string) {
        super(`${Captcha.name} : ${message}`)
      }
    }
    export class ShouldBeAnotherSign extends Error {
      constructor() {
        super(ShouldBeAnotherSign.name)
      }
    }
    export class SignNotFound extends Error {
      constructor() {
        super(SignNotFound.name)
      }
    }
    export class TokenExpired extends Error {
      constructor() {
        super(TokenExpired.name)
      }
    }
    export class TokenConflict extends Error {
      constructor() {
        super(TokenConflict.name)
      }
    }
    export class TokenNotFound extends Error {
      constructor() {
        super(TokenNotFound.name)
      }
    }
    export class InvalidPassword extends Error {
      constructor() {
        super(InvalidPassword.name)
      }
    }
    export class EmailNotConfirmed extends Error {
      constructor() {
        super(EmailNotConfirmed.name)
      }
    }
    export class UserNotFound extends Error {
      constructor() {
        super(UserNotFound.name)
      }
    }
  }
}

export default Service;
