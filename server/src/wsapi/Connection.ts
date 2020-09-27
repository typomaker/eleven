import Message from "./Message";

export abstract class Connection {
  public token?: string

  public abstract respond(message: Message): void;
}