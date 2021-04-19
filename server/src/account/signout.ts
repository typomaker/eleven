import * as entity from "./entity";
import Error from "./Error";
import * as repository from "./repository";

export async function signout(id: string): Promise<entity.Session> {
  const session = await repository.session.find().uuid(id).read().one();
  if (!session) throw new Error.TokenNotFound();
  session.expired = new Date();
  repository.session.save(session);
  return session;
}
export default signout;