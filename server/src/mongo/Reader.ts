import Finder from "./Finder";
import Repository from "./Repository";

export class Reader<T extends object> implements AsyncIterable<T>  {
  constructor(private readonly repository: Repository<T>, private condition?: Finder.Condition<T>) { }

  public async one(): Promise<T | null> {
    const q = this.condition ? await this.repository.build().condition(this.condition) : {}
    const document = await this.repository.collection.findOne(q)
    if (!document) return null;
    const entity = await this.repository.serialize(document as any)
    return entity;
  }

  public async all(): Promise<T[]> {
    const result = [];
    for await (const it of this) result.push(it)
    return result;
  }

  public async *[Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
    const q = this.condition ? await this.repository.build().condition(this.condition) : {};
    const cursor = this.repository.collection.find(q);
    while (await cursor.hasNext()) {
      const raw = await cursor.next();
      yield this.repository.unserialize(raw!)
    }
  }

}
export default Reader;