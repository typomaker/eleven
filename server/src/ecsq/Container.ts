import Entity from "./Entity";

export class Container<T extends Entity> {
  protected readonly entity = new Map<any, T>();

  public set(id: any, component: T | undefined): void {
    if (component === undefined) {
      this.entity.delete(id);
    } else {
      if (this.entity.has(id)) component = { ...this.entity.get(id)!, ...component };
      this.entity.set(id, component)
    }
  }

  public get(id: any): T {
    if (!this.entity.has(id)) throw new Error(`Entity with id ${id} is undefined`);
    return this.entity.get(id)!;
  }

  public has(id: any): boolean {
    return this.entity.has(id);
  }

  [Symbol.iterator]() {
    return this.entity.entries()
  }
}

export default Container;