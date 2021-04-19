import * as uuid from "uuid";


export type Entity = Entity.Id & Partial<(
  & Entity.User
  & Entity.Marker
  & Entity.Display
  & Entity.Indicator
  & Entity.Experience
  & Entity.Physic
  & Entity.Ability
  & Entity.Equipment
  & Entity.Parent
  & Entity.Children
  & Entity.Error
  & Entity.Command
  & Entity.Portal
  & Entity.Active
)>


export namespace Entity {

  export function make(data: Partial<Entity>): Entity {
    return { id: uuid.v4(), ...data };
  }
  export function is<K extends keyof Entity>(entity: Entity, ...required: K[]): entity is Entity.Required<K> {
    for (const key of required) if (!(key in entity)) return false
    return true
  }

  export type Required<T extends keyof Entity> = Entity & globalThis.Required<globalThis.Pick<Entity, T>>

  export type Id = { id: string }

  export type Marker = Record<"character", true>

  export type Parent = { parent: string }

  export type Children = { children: string[] }

  export type User = { user: string }

  export type Display = { display: { name: string, icon?: string } }

  export type Indicator = {
    indicator: {
      injury?: number
      thirst?: number
      hunger?: number
    }
  }

  export type Experience = { experience: { free: number, total: number } }

  export type Physic = { physic: { weight?: number, volume?: number } }

  export type Ability = {
    ability: {
      intelligence?: {
        experience?: number
      },
      stamina?: {
        experience?: number
      },
      strength?: {
        experience?: number
      },
      medicine?: {
        experience?: number
      }
    }
  }

  export type Equipment = { equipment: Array<{ suited: string }> }

  export type Error = {
    error: Error.Code
  }
  export namespace Error {
    export enum Code {
      UUIDNotValid = 1,
      DisplayNameNotValid = 2,
      UserRequired = 3,
    }
  }

  export type Portal = {
    portal: {
      endpoint: string
    }
  }

  export type Command = {
    playerCharacterCreation: string
    playerCharacterActivation: string
  }

  export type Active = {
    active: boolean
  }
}
export default Entity