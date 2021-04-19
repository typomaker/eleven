export * from "./Avatar";


export interface Entity {
  uuid?: Entity.Id
  display?: { name: string, icon?: string }
  health?: { value: number }
  shield?: { value: number }
  experience?: { free: number, total: number }
  material?: { weight: number, volume: number }
  ability?: Entity.Ability
  slot?: Array<{
    suited: string[]
  }>
  event?: Entity.Event
}
export namespace Entity {
  export type Id = string

  export type Event = (
    | { type: "player:character:create", entity: Entity }
  )
  export interface Ability {
    intelligence?: Ability.Item,
    stamina?: Ability.Item,
    strength?: Ability.Item,
    medicine: Ability.Item
  }
  export namespace Ability {
    export interface Item {
      experience?: number
      complexity?: number
    }
  }
}
export default Entity;
