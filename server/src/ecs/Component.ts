
export type Component<T extends object, R extends keyof T = any> = T & Required<Pick<T, R>>
export namespace Component {
  export function cleanup<T extends object>(component: Component<T>): Component<T> {
    for (const key of Object.getOwnPropertyNames(component) as (keyof Component<T>)[]) {
      if (component[key] === undefined) delete component[key];
    }
    return component;
  }
}
export default Component;