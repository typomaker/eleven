import Component from "./Component";
import Container from "./Container";
import Entity from "./Entity";

export class Query<T extends object, R extends keyof T = any> implements Container<Component<T, R>> {
  private data = new Map<Entity, Component<T, R>>();
  private conditions: ((component: Component<T>) => boolean)[] = []

  public filter<R extends keyof T>(keys: R[]): Query<T, R> {
    const f = new Query<T, R>();
    f.conditions = [...this.conditions];
    f.conditions.push((component: Component<T>) => {
      for (const key of keys) if (!(key in component)) return false
      return true
    })
    return f;
  }
  public set(id: string, component: Component<T> | undefined): void {
    if (component) {
      for (const condition of this.conditions) if (!condition(component)) return;
      this.data.set(id, component as Component<T, R>)
    } else {
      this.data.delete(id)
    }
  }
  public get(id: string): Readonly<Component<T, R>> | undefined {
    return this.data.get(id)
  }
  [Symbol.iterator](): IterableIterator<[string, Readonly<Component<T, R>>]> {
    return this.data.entries()
  }
  get length() {
    return this.data.size;
  }
}

export default Query;