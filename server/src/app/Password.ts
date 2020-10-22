import bcrypt from "bcrypt";

class Password {
  constructor(private readonly config: Password.Configuration) { }
  private complicate(v: string): string {
    v += this.config.salt + "EPcibYmvsL";
    return v.split("")
      .map((v, i) => i % 2 ? v.toUpperCase() : v.toLowerCase())
      .reverse()
      .join("");
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
