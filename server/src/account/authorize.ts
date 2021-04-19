import * as uuid from "uuid";
import Error from "./Error";
import * as repository from "./repository";

export async function authorize(id: string) {
  if (!uuid.validate(id)) throw new Error.TokenInvalid();
  const session = await repository.session.find().uuid(id).read().one();
  if (!session) throw new Error.TokenNotFound();
  if (session.expired.getTime() < Date.now()) {
    throw new Error.TokenExpired();
  };
  return session;
}
export default authorize;