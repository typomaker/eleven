import * as mongodb from "mongodb";
import * as game from ".";
import * as util from "../utility";
import Service from "./Service";

export class Repository {
  public readonly entity = new Repository.Entity(this)
  constructor(public readonly service: Service) { }

  public async init() {

    // await this.user.collection.createIndex({ 'email.address': 1 }, { unique: true })
    // await this.user.collection.createIndex({ 'sign.type': 1, 'sign.data': 1 }, { unique: true })
    // await this.session.collection.createIndex({ 'user': 1 })

  }

  public get db() {
    return this.service.app.mongodb.db('game');
  }
}
export namespace Repository {
  type Flat<T> = {
    [K in keyof Omit<T, 'id'>]: (
      T[K] extends game.Entity ? mongodb.Binary :
      T[K] extends Array<game.Entity> ? Array<mongodb.Binary> :
      T[K] extends object ? Flat<T> :
      T[K]
    )
  }
  export class Entity {
    private readonly source = new class Source extends WeakMap<game.Entity, game.Entity> {
      set(key: game.Entity, value: game.Entity) {
        value = game.Entity.copy(value);
        if (this.has(key)) value = Object.assign(this.get(key)!, value)
        return super.set(key, value)
      }
    }();

    constructor(private readonly repository: Repository) { }

    public get collection() {
      return this.repository.db.collection<Repository.Entity.Document>('entity');
    }

    private filterQuery(query?: Repository.Entity.Query): mongodb.FilterQuery<Repository.Entity.Document> {
      if (!query) return {};
      if (util.is.string(query)) return this.filterQuery(['=', 'id', query])
      switch (query[0]) {
        case '&': return { $and: query[1].map(this.filterQuery.bind(this)) }
        case '|': return { $or: query[1].map(this.filterQuery.bind(this)) }
        case '=': switch (query[1]) {
          case 'id': return { _id: util.mongodb.uuid.parse(query[2]) }
          case 'account': return { account: util.mongodb.uuid.parse(query[2]) }
          case 'location.starting': return { $and: [this.filterQuery(['in', 'type', ['location']]), { starting: true }] }
        }
        case 'in': switch (query[1]) {
          case 'id': return { _id: { $in: query[2].map(v => util.mongodb.uuid.parse(v)) } }
          case 'type': return { type: { $in: query[2].map(String) as any } }
        }
      }
    }

    private updateQuery(entity: game.Entity): mongodb.UpdateQuery<Entity.Document> | null {

      const query: mongodb.UpdateQuery<Entity.Document> = {}
      switch (entity.type) {
        case 'character': {
          const source = <game.Entity.Character | undefined>this.source.get(entity);
          const diff: Partial<Entity.Document.Character> = {}
          if (!source) {
            diff._id = util.mongodb.uuid.parse(entity.id)
            diff.type = entity.type;
            diff.account = entity.account;
          }
          if (entity.icon !== source?.icon) diff.icon = entity.icon;
          if (entity.location.id !== source?.location.id) diff.location = util.mongodb.uuid.parse(entity.location.id);
          if (entity.name !== source?.name) diff.name = entity.name;

          if (Object.keys(diff).length) query.$set = diff;
          break
        }
        case 'location': {
          const source = <game.Entity.Location | undefined>this.source.get(entity);
          const add = entity.content.filter((id) => !source?.content.includes(id));
          const remove = source?.content.filter((id) => !entity.content.includes(id)) ?? [];
          if (add.length) query.$addToSet = { content: { $each: add.map(entity => util.mongodb.uuid.parse(entity.id)) } }
          if (remove.length) query.$pull = <any>{ content: { $in: remove.map(entity => util.mongodb.uuid.parse(entity.id)) } }
        }
      }
      return Object.keys(query).length ? query : null
    }

    private convert(entity: game.Entity): Repository.Entity.Document {
      switch (entity.type) {
        case 'character': return {
          _id: util.mongodb.uuid.parse(entity.id),
          type: 'character',
          name: entity.name,
          account: entity.account,
          location: util.mongodb.uuid.parse(entity.location.id),
          icon: entity.icon,
        }
        case 'location': return {
          _id: util.mongodb.uuid.parse(entity.id),
          type: 'location',
          name: entity.name,
          capacity: entity.capacity,
          content: entity.content.map(e => util.mongodb.uuid.parse(e.id)),
          starting: entity.starting,
        }
      }
    }

    public async create(entity: game.Entity | game.Entity[]) {
      if (util.is.array(entity)) {
        await this.collection.insertMany(entity.map((e) => this.convert(e)));
      } else {
        await this.collection.insertOne(this.convert(entity));
      }
    }

    public find(query?: Repository.Entity.Query) {
      const filterQuery = this.filterQuery(query);
      return new class Reader implements AsyncIterable<game.Entity> {
        // Binding is used for resolving the recursive references
        private binding = new Map<string, game.Entity>();
        constructor(protected entity: Entity) { }

        public use(value: Map<string, game.Entity> | null) {
          if (value === null) {
            this.binding = new Map()
          } else {
            this.binding = new Map(value);
          }
          return this;
        }

        private async bind(...ids: string[]) {
          ids = ids.filter(id => !this.binding.has(id));
          if (!ids.length) return
          const documents = await this.entity.collection.find<Repository.Entity.Document>(this.entity.filterQuery(['in', 'id', ids])).toArray();
          for (const document of documents) {
            await this.convert(document)
          }
        }

        private async convert(document: Repository.Entity.Document): Promise<game.Entity> {
          const id = util.mongodb.uuid.stringify(document._id);
          if (this.binding.has(id)) return this.binding.get(id)!
          // temporarily use an empty object to allocate a pointer
          const pointer = <game.Entity>this.binding.get(id) ?? {};
          this.binding.set(id, pointer);
          let entity: game.Entity;
          switch (document.type) {
            case 'character': {
              const location = util.mongodb.uuid.stringify(document.location);
              await this.bind(location);
              entity = <game.Entity.Character>{
                id: util.mongodb.uuid.stringify(document._id),
                type: 'character',
                name: document.name,
                icon: document.icon,
                location: <game.Entity.Location>this.binding.get(location)!,
                account: document.account
              }
              break;
            }
            case 'location': {
              const content = document.content.map(id => util.mongodb.uuid.stringify(id))
              await this.bind(...content);
              entity = <game.Entity.Location>{
                id: util.mongodb.uuid.stringify(document._id),
                type: 'location',
                name: document.name,
                capacity: document.capacity,
                content: content.map(id => this.binding.get(id)!),
                starting: document.starting
              }
              break;
            }
          }
          this.entity.source.set(pointer, entity);
          return Object.assign(<game.Entity.Location>pointer, entity)
        }
        public async one() {
          const document = await this.entity.collection.findOne<Repository.Entity.Document>(filterQuery)
          if (!document) return null;
          const entity = await this.convert(document)
          return entity;
        }

        public async all() {
          const documents = await this.entity.collection.find<Repository.Entity.Document>(filterQuery).toArray();
          const result = []
          for (const document of documents) {
            const entity = await this.convert(document)
            result.push(entity)
          }
          return result;
        }
        async *[Symbol.asyncIterator](): AsyncGenerator<game.Entity> {
          const cursor = this.entity.collection.find<Repository.Entity.Document>(filterQuery);
          while (await cursor.hasNext()) {
            const document = (await cursor.next())!
            const entity = await this.convert(document)
            yield entity
          }
        }
      }(this)
    }

    public async delete(...entities: game.Entity[]) {
      const query = this.filterQuery(['in', 'id', entities.map(v => v.id)]);
      await this.collection.deleteMany(query);
    }

    public async save(...entities: game.Entity[]) {

      const operations: mongodb.BulkWriteOperation<Entity.Document>[] = [];
      const sources: game.Entity[] = [];

      for (const entity of entities) {
        const update = this.updateQuery(entity);
        if (!update) continue;
        const filter = this.filterQuery(entity.id);
        operations.push({ updateOne: { filter, update, upsert: true } })
        sources.push(entity)
      }

      if (operations.length) await this.collection.bulkWrite(operations);

      for (const source of sources) {
        this.source.set(source, source)
      }
    }
  }
  export namespace Entity {
    export type Document = (
      | Document.Character
      | Document.Location
    )
    export namespace Document {
      export type Character = { _id: mongodb.Binary } & Flat<game.Entity.Character>
      export type Location = { _id: mongodb.Binary } & Flat<game.Entity.Location>
    }
    export type Query = string | (
      | ["&" | "|", Query[]]
      | ["=", "id", string]
      | ["=", "account", string]
      | ["=", "location.starting", boolean]
      | ["in", "id", string[]]
      | ["in", "type", ('location' | 'character')[]]
    );
  }
}
export default Repository;