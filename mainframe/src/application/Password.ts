import bcrypt from "bcrypt";

class Password {
  constructor(private readonly config: Password.Configuration) { }
  private complicate(v: string): string {
    if (v.length === 1) v = this.config.salt + v;
    return v.split("").reverse().join(this.config.salt);
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
  export type Configuration = {
    salt: string,
    rounds: number
  }
}
export default Password;