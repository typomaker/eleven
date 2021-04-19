export class Observer<T extends object> {
  // map with key is T and value is Proxy object
  // used for resolve recursive references
  private registry = new WeakMap();

  // set of all proxy instances
  // used to avoid using a proxy over another
  private proxies = new WeakSet();

  constructor(private readonly notify: (entity: T) => void) { }

  private proxy(target: T): T;
  private proxy<V extends object>(target: V, entity: T): V;
  private proxy(target: any, entity?: any): any {
    if (this.proxies.has(target)) return target;
    if (this.registry.has(target)) return this.registry.get(target);

    const proxy = new Proxy(Object.assign({}, target), {
      set: (target, key, value, receiver) => {
        const prev = Reflect.get(target, key, receiver);
        const ok = Reflect.set(target, key, value, receiver);
        if (ok && value !== prev) this.notify(proxy);
        return ok;
      },
      deleteProperty: (target, key) => {
        const ok = Reflect.deleteProperty(target, key);
        if (ok) this.notify(proxy);
        return ok;
      },
    });

    this.proxies.add(proxy);
    this.registry.set(target, proxy);

    // invoking init recursive for nested objects
    for (const [key, value] of Object.entries(target)) {
      if (typeof value === "object" && value !== null) {
        Reflect.set(target, key, this.proxy(value, entity ?? target))
      }
    }

    return proxy;
  }

  public assign(entity: T) {
    return this.proxy(entity);
  }
}

export default Observer;