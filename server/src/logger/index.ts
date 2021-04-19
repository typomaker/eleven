export class Logger {

  private static default = new Logger({ pid: process.pid, env: process.env.NODE_ENV });
  public static info = Logger.default.info;
  public static debug = Logger.default.debug;
  public static warning = Logger.default.warning;
  public static error = Logger.default.error;
  public static with = Logger.default.with;

  constructor(private readonly data: object) { }

  private static async log(message: Context.Message, data?: Context.Data) {
    data ??= {};
    if (typeof message === "string") {
      data.message = message
    } else if (message instanceof Error) {
      data.message = message.message;
      data.error = `${message.name}${message.message}`
      data.stack = data.stack?.split("\n").splice(3)
    }

    // data.caller ??= new Error().stack?.split("\n")
    data.time = new Date().toISOString();

    const text = JSON.stringify(data, undefined, 1)?.replace(/\n\s*/g, "");
    return Promise.resolve().then(() => console.log(text))
  }
  public async info(message: Context.Message, data?: Context.Data) {
    return Logger.log(message, { ...data, level: "info" })
  }
  public async error(message: Context.Message, data?: Context.Data) {
    return Logger.log(message, { ...data, level: "error" })
  }
  public async warning(message: Context.Message, data?: Context.Data) {
    return Logger.log(message, { ...data, level: "warning" })
  }
  public async debug(message: Context.Message, data?: Context.Data) {
    if (process.env.NODE_ENV === "production") return;
    return Logger.log(message, { ...data, level: "debug" })
  }
  public with(data: Context.Data) {
    return new Logger({ ...this.data, ...data });
  }
}
export namespace Context {
  export type Message = string | Error
  export type Data = {
    error?: Error | string
    [K: string]: any
  }
}
export default Logger;
