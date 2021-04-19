export interface User {
  uuid: string;
  name: string;
  avatar?: string;
  created: Date;
  deleted?: Date;
  email: User.Email[];
  sign: User.Sign[];
  character: string[];
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
export interface Session {
  uuid: string;
  user: string;
  created: Date;
  expired: Date;
}
export type Signin = (
  | Signin.Facebook
  | Signin.Password
)
export namespace Signin {
  export type Facebook = { type: "fb", token: string }
  export type Password = { type: "pw", password: string, recaptcha2: string, email: string }
}