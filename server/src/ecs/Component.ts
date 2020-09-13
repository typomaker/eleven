export type Component<T, D extends keyof T = any> = Partial<T> & Required<Pick<T, D>>

export namespace Component {

  export type Property<T> = keyof T;

  export function cleanup<T>(entity: Component<T>): Component<T> {
    const keys = Object.keys(entity) as (keyof object)[];
    for (const key of keys) {
      if (entity[key] === undefined) delete entity[key]
    }
    return entity;
  }

  export function property<T>(component: Component<T>): Component.Property<T>[] {
    return Object.getOwnPropertyNames(component) as Component.Property<T>[]
  }
}

export default Component;