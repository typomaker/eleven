class Logger {
  constructor(private readonly tags: string[] = []) { }
  public async log(...message: any[]) {
    return Promise.resolve().then(() => console.log(this.tag("log").stringify(...message)))
  }
  public async trace(...message: any[]) {
    return Promise.resolve().then(() => console.trace(this.tag("trace").stringify(...message)));
  }
  public async info(...message: any[]) {
    return Promise.resolve().then(() => console.info(this.tag("info").stringify(...message)));
  }
  public async error(...message: any[]) {
    return Promise.resolve().then(() => console.error(this.tag("error").stringify(...message)));
  }
  public async warning(...message: any[]) {
    return Promise.resolve().then(() => console.warn(this.tag("warning").stringify(...message)));
  }
  public async debug(...message: any[]) {
    return Promise.resolve().then(() => console.debug(this.tag("debug").stringify(...message)));
  }
  public tag(...name: any[]): Logger {
    return new Logger([...this.tags, ...name]);
  }
  protected stringify(...message: any[]) {
    return this.tags.map((tag) => `[${tag}]`).join("") + " " + message.join(" ").trim();
  }
}

export default Logger;
