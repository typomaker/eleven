import mongodb from "mongodb";
import Finder from "./Finder";
import Repository from "./Repository";

export class Builder<T extends object> {
  constructor(private readonly respository: Repository<T>) { }

  public async condition(condition: Finder.Condition<any>): Promise<mongodb.Document> {
    switch (condition[1]) {
      case "match": return { [condition[0]]: { $elemMatch: await this.condition(condition[2]) } }
      case "&": return { $and: [await this.condition(condition[0]), await this.condition(condition[2])] }
      case "|": return { $or: [await this.condition(condition[0]), await this.condition(condition[2])] }
      case "!=": return { [condition[0]]: { $ne: condition[2] } };
      case "=": return { [condition[0]]: { $eq: condition[2] } };
      case "<": return { [condition[0]]: { $lt: condition[2] } };
      case ">": return { [condition[0]]: { $gt: condition[2] } };
      case ">=": return { [condition[0]]: { $gte: condition[2] } };
      case "<=": return { [condition[0]]: { $lte: condition[2] } };
      case "in": return { [condition[0]]: { $in: condition[2] } };
      case "!in": return { [condition[0]]: { $nin: condition[2] } };
      case "exist": return { [condition[0]]: { $exists: true } };
      case "!exist": return { [condition[0]]: { $exists: false } };
    }
  }

  public async update(data: Repository.Data<T>): Promise<mongodb.Document | null> {
    return { $set: data }
  }
}

export default Builder;