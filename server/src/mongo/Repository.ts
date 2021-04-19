import mongodb from "mongodb";
import Builder from "./Builder";
import client from "./client";
import Finder from "./Finder";

export abstract class Repository<T extends object> {
  protected get client() {
    return client;
  }
  public abstract get db(): mongodb.Db;
  public abstract get collection(): mongodb.Collection;

  public build(): Builder<T> {
    return new Builder(this)
  }

  public find(): Finder<T> {
    return new Finder<T>(this);
  }

  public async serialize(data: Repository.Data<T>): Promise<Repository.Data.Raw<T>> {
    return data;
  }

  public async unserialize(raw: Repository.Data.Raw<T>): Promise<Repository.Data<T>> {
    return raw;
  }

  public async save(data: Repository.Data<T>): Promise<void> {
    const q = await this.build().update(data)
    if (q) await this.collection.updateOne({ _id: data._id }, q, { upsert: true });
  }
}
export namespace Repository {
  export type Data<T extends object> = T & {
    readonly _id?: mongodb.ObjectId
  }
  export namespace Data {
    export type Raw<T extends object> = T & any;
  }
}

export default Repository;