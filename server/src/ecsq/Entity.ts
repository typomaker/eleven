export interface Entity {
  [K: string]: any
}
export namespace Entity {
  export function cleanup(component: Entity): Entity {
    for (const key of Object.getOwnPropertyNames(component)) {
      if (component[key] === undefined) delete component[key];
    }
    return component;
  }
}
export default Entity