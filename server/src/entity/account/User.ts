import Email from "./Email";
import uuid from "./node_modules/uuid/v4";

export class User {
  public id: string;
  public name: string;
  public avatar: string | null;
  public created: Date;
  public emails: Email[];
  public deleted: Date | null;

  constructor(p: Property = {}) {
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
export type Property = Partial<Pick<User, (
  | "avatar"
  | "id"
  | "name"
  | "created"
  | "emails"
  | "deleted"
)>>;
export default User;