import Repository from "../account/Repository";
import { Container } from "../app";

export class Service {

  constructor(public readonly app: Container) { }

  public async init() {
    await this.account.init()
  }

  public readonly account = new Repository(this.app.mongodb);

}

export default Service;