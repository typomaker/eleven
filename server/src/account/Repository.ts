import * as mongodb from "mongodb";
import * as account from ".";
import * as util from "../storage/util";

export class Repository {
  constructor(private readonly conn: mongodb.MongoClient) { }

  public async init() {
    await this.user.collection.createIndex({ 'email.address': 1 }, { unique: true })
    await this.user.collection.createIndex({ 'sign.type': 1, 'sign.data': 1 }, { unique: true })
    await this.session.collection.createIndex({ 'user': 1 })
  }

  public get db() {
    return this.conn.db('account');
  }
  public readonly user = new Repository.User(this)
  public readonly session = new Repository.Session(this);
}
export namespace Repository {

  export class Session {
    constructor(private readonly account: Repository) { }

    public get collection() {
      return this.account.db.collection('session');
    }
    private query(query?: Session.Query): mongodb.FilterQuery<Session.Document> {
      if (!query) return {};
      if (typeof query === "string") return this.query(["=", "id", query])
      switch (query[0]) {
        case "&": return { $and: query[1].map(this.query.bind(this)) }
        case "|": return { $or: query[1].map(this.query.bind(this)) }
        case "=": switch (query[1]) {
          case "id": return { _id: util.uuid.parse(query[2]) }
          case "user": return { user: util.uuid.parse(query[2]) }
          case "sign": return { sign: util.uuid.parse(query[2]) }
          case "expired": return { expired: (query[2] ? { $lt: new Date() } : { $gte: new Date() }) }
        }
      }
    }

    private async entity(document: Session.Document): Promise<account.entity.Session> {
      const user = await this.account.user.get(util.uuid.stringify(document.user));
      if (!user) throw new Error(`broken entity, user not found for session ${document._id}`)
      return {
        id: util.uuid.stringify(document._id),
        user,
        created: document.created,
        expired: document.expired,
      }
    }

    private document(entity: account.entity.Session): Session.Document {
      return {
        _id: util.uuid.parse(entity.id),
        user: util.uuid.parse(entity.user.id),
        created: entity.created,
        expired: entity.expired,
      }
    }

    public async create(data: account.entity.Session) {
      await this.collection.insertOne(this.document(data));
    }
    public async get(id: string) {
      const r = await this.collection.findOne<Session.Document>(this.query(id));
      return r ? this.entity(r) : r;
    }
    public async save(data: account.entity.Session) {
      await this.collection.updateOne(this.query(data.id), { $set: this.document(data) }, { upsert: true });
    }
    public async *find(query?: Session.Query): AsyncGenerator<account.entity.Session> {
      const q = this.query(query);
      const cursor = this.collection.find<Session.Document>(q);
      while (await cursor.hasNext()) {
        const document = await cursor.next();
        yield this.entity(document!)
      }
    }
  }
  export namespace Session {
    export type Document = Omit<account.entity.Session, 'id' | 'user' | 'sign'> & { _id: mongodb.Binary, user: mongodb.Binary, sign?: mongodb.Binary }

    export type Query = string | (
      | ["&" | "|", Query[]]
      | ["=", "id", string]
      | ["=", "user", string]
      | ["=", "sign", string]
      | ["=", "expired", boolean]
    )
  }
  export class User {
    constructor(private readonly account: Repository) { }

    public get collection() {
      return this.account.db.collection('user');
    }

    private query(query?: Repository.Query): mongodb.FilterQuery<Repository.Document> {
      if (!query) return {};
      if (typeof query === 'string') return this.query(['=', 'id', query])
      switch (query[0]) {
        case "&": return { $and: query[1].map(this.query.bind(this)) }
        case "|": return { $or: query[1].map(this.query.bind(this)) }
        case "=": switch (query[1]) {
          case "id": return { _id: util.uuid.parse(query[2]) }
          case "email": return { email: { $elemMatch: { address: query[2] } } }
          case "sign": return { sign: { $elemMatch: { type: query[1], data: query[2] } } }
        }
      }
    }

    private entity(document: Repository.Document): account.entity.User {
      return {
        id: util.uuid.stringify(document._id),
        created: document.created,
        name: document.name,
        avatar: document.avatar,
        email: document.email,
        sign: document.sign,
        deleted: document.deleted,
      }
    }

    private document(entity: account.entity.User): Repository.Document {
      return {
        _id: util.uuid.parse(entity.id),
        created: entity.created,
        name: entity.name,
        avatar: entity.avatar,
        email: entity.email,
        sign: entity.sign,
        deleted: entity.deleted,
      }
    }

    public async get(arg: Repository.Query) {
      const r = await this.collection.findOne<Repository.Document>(this.query(arg))
      return r ? this.entity(r) : r;
    }

    public async save(data: account.entity.User) {
      await this.collection.updateOne(this.query(data.id), { $set: this.document(data) }, { upsert: true });
    }

    public async *find(query?: Repository.Query): AsyncGenerator<account.entity.User> {
      const q = this.query(query);
      const cursor = this.collection.find<Repository.Document>(q);
      while (await cursor.hasNext()) {
        const document = await cursor.next();
        yield this.entity(document!)
      }
    }
  }
  export namespace Repository {
    export type Document = { _id: mongodb.Binary } & Omit<account.entity.User, 'id'>
    export type Query = string | (
      | ["&" | "|", Query[]]
      | ["=", "email", string]
      | ["=", "id", string]
      | ["=", "sign", account.entity.User.Sign["type"], string]
    );
  }
}
export default Repository;