import * as game from '../../game';


export type Entity = (
  Entity.Character
)
export namespace Entity {
  export type Character = {
    id: string
    type: 'character'
    name: string
    icon?: string
    location: string
  }
  export function create(entity: game.Entity): Entity {
    switch (entity.type) {
      case 'character': return {
        id: entity.id,
        type: entity.type,
        name: entity.name,
        icon: entity.icon,
        location: entity.location.id,
      }
      default: throw new TypeError(`unexpected entity ${JSON.stringify(entity)}`)
    }
  }
}
export default Entity;