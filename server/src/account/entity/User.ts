
export interface User {
  id: string;
  name: string;
  avatar?: string;
  created: Date;
  deleted?: Date;
  email: User.Email[];
  sign: User.Sign[];
}
export namespace User {
  export interface Email {
    address: string;
    confirmed?: Date;
  }
  export interface Sign {
    type: "fb" | "pw";
    data: string;
  }
}
export default User;