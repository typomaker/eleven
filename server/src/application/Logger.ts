class Logger {
  constructor(private readonly tags: string[] = []) { }
  public log(...message: any[]) {
    console.log(this.tag("log").stringify(...message));
  }
  public trace(...message: any[]) {
    console.trace(this.tag("trace").stringify(...message));
  }
  public info(...message: any[]) {
    console.info(this.tag("info").stringify(...message));
  }
  public error(...message: any[]) {
    console.error(this.tag("error").stringify(...message));
  }
  public warning(...message: any[]) {
    console.warn(this.tag("warning").stringify(...message));
  }
  public debug(...message: any[]) {
    console.debug(this.tag("debug").stringify(...message));
  }
  public tag(...name: any[]): Logger {
    return new Logger([...this.tags, ...name]);
  }
  protected stringify(...message: any[]) {
    return this.tags.map((tag) => `[${tag}]`).join("") + " " + message.join(" ").trim();
  }
}

export default Logger;
