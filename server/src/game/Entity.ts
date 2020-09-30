import * as component from "./component";

export type Entity = (
  | Entity.Character
  | Entity.Location
)

export namespace Entity {
  export type Character = (
    & component.Kind<"character">
    & component.Name
    & component.Icon
    & component.HP
    & component.AP
    & component.Location
  )
  export type Location = (
    & component.Kind<"location">
    & component.Name
    & component.Container
    & component.Way
  )
}

export default Entity;