import uuid from "uuid/v4";
import Email from "./Email";

export class User {
  public id: string;
  public name: string;
  public avatar: string | null;
  public created: Date;
  public emails: Email[];
  public deleted: Date | null;

  constructor(p: User.Property = {}) {
    this.id = p.id ?? uuid();
    this.name = p.name ?? "";
    this.avatar = p.avatar ?? null;
    this.created = p.created ?? new Date();
    this.emails = p.emails ?? [];
    this.deleted = p.deleted ?? null;
  }

  public get isDelete() {
    return this.deleted !== null;
  }
}
export namespace User {
  export type Property = Partial<Pick<User, (
    | "avatar"
    | "id"
    | "name"
    | "created"
    | "emails"
    | "deleted"
  )>>;
}
export default User;
