import axios from "axios";
import * as uuid from "uuid";
import * as env from "../env";
import * as pwd from "../pwd";
import * as entity from "./entity";
import Error from "./Error";
import recaptcha2 from "./recaptcha2";
import * as repository from "./repository";

export async function signin(data: entity.Signin): Promise<entity.Session> {
  let user: entity.User;
  switch (data.type) {
    case "fb": user = await signin.facebook(data); break;
    case "pw": user = await signin.password(data); break;
    default: throw new TypeError("arg is invalid type");
  }

  for await (const session of repository.session.find().by([["user", "=", user.uuid], "&", ["expired", "<", new Date()]]).read()) {
    session.expired = new Date();
    await repository.session.save(session);
  }

  const expiration = new Date(Date.now() + env.session.ttl);
  const session: entity.Session = { user: user.uuid, created: new Date(), expired: expiration, uuid: uuid.v4() };
  await repository.session.save(session);
  return session;
}
export namespace signin {

  export async function facebook(arg: entity.Signin.Facebook) {
    const fb = await axios.get(`https://graph.facebook.com/v4.0/me`, { params: { access_token: arg.token, fields: "id,email,name" } });

    let user = await repository.user.find().sign({ type: "fb", data: fb.data.id }).read().one()
    if (!user && fb?.data?.email) {
      user = await repository.user.find().by(["email.address", "=", fb.data.email]).read().one();
    }
    if (!user) {
      user = {
        uuid: uuid.v4(),
        name: fb.data.name || fb.data.email?.split("@")[0],
        created: new Date(),
        email: [],
        sign: [{ type: "fb", data: fb.data.id }],
        character: []
      };
    }
    let email = user.email?.find((email) => email.address === fb.data.email);
    if (!email && fb?.data?.email) {
      email = { address: fb.data.email, confirmed: new Date() };
      user.email.push(email)
    }
    if (!email?.confirmed) throw new Error.EmailNotConfirmed();

    const sign = user.sign.find((v) => v.type === "fb" && v.data === fb.data.id);
    if (!sign) {
      user.sign.push({ type: "fb", data: fb.data.id });
    }
    await repository.user.save(user);
    return user;
  }

  export async function password(data: entity.Signin.Password) {
    try {
      await recaptcha2.validate(data.recaptcha2);
    } catch (e) {
      throw new Error.Captcha(recaptcha2.translateErrors(e));
    }

    let user = await repository.user.find().by(["email.address", "=", data.email]).read().one()
    if (!user) {
      user = {
        uuid: uuid.v4(),
        name: data.email.split("@")[0],
        created: new Date(),
        email: [{ address: data.email }],
        sign: [{ type: "pw", data: await pwd.hash(data.password) }],
        character: []
      };
    }
    const sign = user.sign.find((v) => v.type === "pw");
    if (!sign) throw new Error.ShouldBeAnotherSign();
    if (!await pwd.compare(data.password, sign.data)) throw new Error.PasswordInvalid();

    await repository.user.save(user);
    return user;
  }

}

export default signin;