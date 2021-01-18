// import * as mongodb from "mongodb";
// import * as game from ".";
// import * as tool from "../tool";
// import Service from "./Service";

// export class Repository {
//   public readonly entity = new Repository.Entity(this)
//   constructor(public readonly service: Service) { }

//   public async init() {

//     // await this.user.collection.createIndex({ 'email.address': 1 }, { unique: true })
//     // await this.user.collection.createIndex({ 'sign.type': 1, 'sign.data': 1 }, { unique: true })
//     // await this.session.collection.createIndex({ 'user': 1 })

//   }

//   public get db() {
//     return this.service.app.mongodb.db('game');
//   }
// }
// export namespace Repository {
//   export class Entity {
//     private readonly story = new WeakMap<game.Entity, game.Entity>();

//     constructor(private readonly repository: Repository) { }

//     public get collection() {
//       return this.repository.db.collection<Repository.Entity.Document>('entity');
//     }

//     private buildFilterQuery(query?: Repository.Entity.Query): mongodb.FilterQuery<Entity.Document> {
//       if (!query) return {};
//       if (tool.is.string(query)) return this.buildFilterQuery(['=', 'uuid', query])
//       switch (query[0]) {
//         case '&': return { $and: query[1].map(this.buildFilterQuery.bind(this)) }
//         case '|': return { $or: query[1].map(this.buildFilterQuery.bind(this)) }
//         case '=': switch (query[1]) {
//           case 'uuid': return { uuid: tool.mongodb.uuid.parse(query[2]) }
//           case 'account.uuid': return { "account.uuid": tool.mongodb.uuid.parse(query[2]) }
//         }
//         case 'in': switch (query[1]) {
//           case 'uuid': return { uuid: { $in: query[2].map((it) => tool.mongodb.uuid.parse(it)) } }
//         }
//       }
//     }

//     private buildUpdateQuery(entity: game.Entity): mongodb.UpdateQuery<Entity.Document> | null {

//       const source = this.story.get(entity);

//       const $set: any = {};
//       const $unset: any = {}
//       const $addToSet: any = {};
//       const $pull: any = {};

//       if (entity.account !== source?.account) {
//         if (!entity.account) $unset.account = '';
//         else $set['account.uuid'] = tool.mongodb.uuid.parse(entity.account.uuid)
//       }

//       if (entity.area !== source?.area) {
//         if (!entity.area) $unset.area = ''
//         else {
//           const add = entity.area.content.filter((it) => !source?.area?.content.includes(it)) ?? []
//           if (add.length) $addToSet['area.content'] = { $each: add.map((it) => tool.mongodb.uuid.parse(it.uuid)) }
//           const remove = source?.area?.content.filter((v) => !entity.area?.content.includes(v)) ?? []
//           if (remove.length) $pull['area.content'] = { $in: remove.map((en) => tool.mongodb.uuid.parse(en.uuid)) }
//         }
//       }

//       if (entity.display !== source?.display) {
//         if (!entity.display) $unset.display = '';
//         else {
//           if (entity.display.name !== source?.display?.name) $set['display.name'] = entity.display.name;
//           if (entity.display.icon !== source?.display?.icon) {
//             if (!entity.display.icon) $unset['display.icon'] = '';
//             else $set['display.icon'] = entity.display.icon;
//           }
//         }
//       }

//       if (entity.gate !== source?.gate) {
//         if (!entity.gate) $unset.gate = '';
//         else $set.gate = { ...entity.gate, area: { ...entity.gate.area, uuid: tool.mongodb.uuid.parse(entity.gate.area.uuid) } }
//       }

//       if (entity.soundness !== source?.soundness) {
//         if (!entity.soundness) $unset.soundness = ''
//         else {
//           if (entity.soundness.current !== source?.soundness?.current) $set['soundness.current'] = entity.soundness.current;
//           if (entity.soundness.total !== source?.soundness?.total) $set['soundness.total'] = entity.soundness.total;
//         }
//       }

//       if (entity.playable !== source?.playable) {
//         if (!entity.playable) $unset.playable = '';
//         else $set.playable = entity.playable;
//       }

//       const query: mongodb.UpdateQuery<Entity.Document> = {}
//       if (!tool.is.empty($set)) query.$set = $set;
//       if (!tool.is.empty($unset)) query.$unset = $unset;
//       if (!tool.is.empty($addToSet)) query.$addToSet = $addToSet;
//       if (!tool.is.empty($pull)) query.$pull = $pull;

//       return Object.keys(query).length ? query : null
//     }

//     private convert(entity: game.Entity): Entity.Document {
//       const document: Entity.Document = { _id: new mongodb.ObjectID() };
//       if (entity.account) document.account = { ...entity.account, uuid: tool.mongodb.uuid.parse(entity.account.uuid) }
//       if (entity.area) document.area = { ...entity.area, content: entity.area.content.map((it) => ({ ...it, uuid: tool.mongodb.uuid.parse(it.uuid) })) }
//       if (entity.display) document.display = { ...entity.display }
//       if (entity.gate) document.gate = { ...entity.gate, area: { ...entity.gate.area, uuid: tool.mongodb.uuid.parse(entity.gate.area.uuid)} }
//       if (entity.soundness) document.soundness = { ...entity.soundness }
//       if (entity.playable) document.playable = entity.playable
//       return document;
//     }

//     public async create(entity: game.Entity | game.Entity[]) {
//       if (tool.is.array(entity)) {
//         await this.collection.insertMany(entity.map((e) => this.convert(e)));
//       } else {
//         await this.collection.insertOne(this.convert(entity));
//       }
//     }

//     public find(query?: Repository.Entity.Query) {
//       const filterQuery = this.buildFilterQuery(query);
//       return new class Reader implements AsyncIterable<game.Entity> {
//         // Binding is used for resolving the recursive references
//         private readonly binding = new class extends Map<string, game.Entity>{
//           public get(id: string) {
//             if (!this.has(id)) this.set(id, { uuid: id })
//             return super.get(id)!
//           }
//           public extend(map: ReadonlyMap<string, game.Entity>) {
//             for (const [id, entity] of map) this.set(id, entity);
//           }
//           public replace(map: ReadonlyMap<string, game.Entity>) {
//             this.clear();
//             this.extend(map);
//           }
//         }();
//         constructor(protected entity: Entity) { }

//         public have(value: Map<string, game.Entity> | null) {
//           if (value === null) {
//             this.binding.clear()
//           } else {
//             this.binding.replace(value);
//           }
//           return this;
//         }

//         private async bind(document: Entity.Document) {
//           const id = tool.mongodb.uuid.stringify(document._id);
//           if (this.binding.has(id)) return this.binding.get(id)
//           // temporarily using an empty entity to allocate a pointer before getting a related entities, which can contains recursive references
//           const binding = this.binding.get(id);
//           let ids: string[] = []
//           if (document.place) ids.push(...document.place.content.map((v) => tool.mongodb.uuid.stringify(v)))
//           if (document.gate) ids.push(tool.mongodb.uuid.stringify(document.gate.target));
//           if (document.position) ids.push(tool.mongodb.uuid.stringify(document.position))
//           ids = ids.filter((id) => !this.binding.has(id));
//           if (ids.length) {
//             const documents = await this.entity.collection.find<Entity.Document>(this.entity.buildFilterQuery(['in', 'id', ids])).toArray();
//             for (const document of documents) {
//               await this.convert(document)
//             }
//           }
//           return binding;
//         }

//         private async convert(document: Repository.Entity.Document): Promise<game.Entity> {
//           const id = tool.mongodb.uuid.stringify(document._id);
//           if (this.binding.has(id)) return this.binding.get(id)!
//           const entity = await this.bind(document);
//           if (document.account) entity.account = tool.mongodb.uuid.stringify(document.account);
//           if (document.place) entity.place = { ...document.place, content: document.place.content.map((doc) => this.binding.get(tool.mongodb.uuid.stringify(doc))!) }
//           if (document.display) entity.display = { ...document.display }
//           if (document.gate) entity.gate = { ...document.gate, target: this.binding.get(tool.mongodb.uuid.stringify(document.gate.target))! }
//           if (document.soundness) entity.soundness = { ...document.soundness }
//           if (document.position) entity.position = this.binding.get(tool.mongodb.uuid.stringify(document.position))
//           if (document.playable) entity.playable = document.playable
//           this.entity.story.commit(entity);
//           return entity;
//         }
//         public async one() {
//           const document = await this.entity.collection.findOne<Repository.Entity.Document>(filterQuery)
//           if (!document) return null;
//           const entity = await this.convert(document)
//           return entity;
//         }

//         public async all() {
//           const documents = await this.entity.collection.find<Repository.Entity.Document>(filterQuery).toArray();
//           const result = []
//           for (const document of documents) {
//             const entity = await this.convert(document)
//             result.push(entity)
//           }
//           return result;
//         }

//         public async random() {
//           const items = await this.all()
//           return items[Math.floor(Math.random() * items.length)];
//         }

//         async *[Symbol.asyncIterator](): AsyncGenerator<game.Entity> {
//           const cursor = this.entity.collection.find<Repository.Entity.Document>(filterQuery);
//           while (await cursor.hasNext()) {
//             const document = (await cursor.next())!
//             const entity = await this.convert(document)
//             yield entity
//           }
//         }
//       }(this)
//     }

//     public async delete(...entities: game.Entity[]) {
//       const query = this.buildFilterQuery(['in', 'id', entities.map((v) => v.uuid)]);
//       await this.collection.deleteMany(query);
//     }

//     public async save(...entities: game.Entity[]) {

//       const operations: mongodb.BulkWriteOperation<Entity.Document>[] = [];
//       const sources: game.Entity[] = [];

//       for (const entity of entities) {
//         const update = this.buildUpdateQuery(entity);
//         if (!update) continue;
//         const filter = this.buildFilterQuery(entity.uuid);
//         operations.push({ updateOne: { filter, update, upsert: true } })
//         sources.push(entity)
//       }

//       if (operations.length) await this.collection.bulkWrite(operations);

//       for (const source of sources) {
//         this.story.set(source, source)
//       }
//     }
//   }
//   export namespace Entity {
//     export type Document = {
//       _id: mongodb.ObjectID
//       account?: { uuid: mongodb.Binary }
//       area?: { content: { uuid: mongodb.Binary }[] }
//       display?: { name: string }
//       experience?: { free: number, total: number }
//       gate?: { name?: string, area: { uuid: mongodb.Binary }, duration?: number }
//       holder?: { uuid: mongodb.Binary }
//       material?: { weight: number, volume: number }
//       playable?: boolean
//       soundness?: { current: number, total: number }
//       uuid: mongodb.Binary
//     }

//     export type Query = string | (
//       | ["&" | "|", Query[]]
//       | ["=", "account.uuid", string]
//       | ["=", "uuid", string]
//       | ["in", "uuid", string[]]
//     );
//   }
// }
// export default Repository;