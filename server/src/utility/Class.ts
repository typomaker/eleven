export type Class<T> = new (...args: any[]) => T;

export namespace Class {
  export class Map<T extends object> {
    #data: globalThis.Map<any, any> = new globalThis.Map();
    constructor(items: T[] = []) {
      for (const item of items) {
        this.#data.set(Object.getPrototypeOf(item), item);
      }
    }
    public has<V extends T>(key: Class<V>) {
      return this.#data.has(key);
    }
    public get<V extends T>(key: Class<V>): V | undefined {
      return this.#data.get(key);
    }
    public set<V extends T>(key: Class<V>, value: V) {
      this.#data.set(key, value);
    }
    public delete<V extends T>(key: Class<V>) {
      return this.#data.delete(key);
    }
    public keys(): IterableIterator<Class<T>> {
      return this.#data.keys();
    }
    public values(): IterableIterator<T> {
      return this.#data.values();
    }
    protected [Symbol.iterator](): IterableIterator<[Class<T>, T]> {
      return this.#data.entries()
    }
  }
}

export default Class;