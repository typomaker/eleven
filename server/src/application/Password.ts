import bcrypt from "bcrypt";

class Password {
  constructor(private readonly config: Password.Configuration) { }
  private complicate(v: string): string {
    const separator = this.config.salt.charAt(0);
    return this.config.salt + v.split("").reverse().join(separator);
  }
  public async hash(v: string) {
    v = this.complicate(v);
    return await bcrypt.hash(v, await bcrypt.genSalt(this.config.rounds));
  }
  public async compare(v: string, encrypted: string) {
    v = this.complicate(v);
    return await bcrypt.compare(v, encrypted);
  }
}
namespace Password {
  export interface Configuration {
    salt: string;
    rounds: number;
  }
}
export default Password;
