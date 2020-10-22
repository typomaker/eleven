
export type Entity = (
  | Entity.Character
  | Entity.Location
)
export namespace Entity {
  export function copy(entity: Entity): Entity {
    switch (entity.type) {
      case 'character': return Character.copy(entity);
      case 'location': return Location.copy(entity)
    }
  }
  export interface Character {
    type: 'character'
    id: string
    name: string
    icon?: string
    account?: string
    location: Location
  }
  export namespace Character {
    export function copy(entity: Character): Character {
      return { ...entity }
    }
  }
  export interface Location {
    type: 'location'
    id: string
    name: string
    capacity?: number
    content: Entity[]
    starting?: true
  }
  export namespace Location {
    export function copy(entity: Location): Location {
      return { ...entity, content: [...entity.content] }
    }
  }
  export interface Transition {
    type: 'transition'
    destination: Location
    distance: number
    complexity?: number
  }
}

export default Entity;

'93aa4dd2-3e9a-4b23-a97c-4c96efd7ea43'