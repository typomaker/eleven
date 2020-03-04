class Logger {
  private static format(ns: string, message: string) {
    return `[${ns}] ${message}`
  }
  public log(message: string, ...optional: any) {
    console.log(Logger.format("error", message), ...optional);
  }
  public trace(message: string, ...optional: any) {
    console.trace(Logger.format("error", message), ...optional);
  }
  public info(message: string, ...optional: any) {
    console.info(Logger.format("info", message), ...optional);
  }
  public error(message: string, ...optional: any) {
    console.error(Logger.format("error", message), ...optional);
  }
  public warning(message: string, ...optional: any) {
    console.warn(Logger.format("warning", message), ...optional);
  }
  public debug(message: string, ...optional: any) {
    console.debug(Logger.format("debug", message), ...optional);
  }
}

export default Logger;