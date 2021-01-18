import * as ecsq from '../ecsq';

export interface Entity extends ecsq.Entity {
  account?: { uuid: string }
  area?: { content: { uuid: string }[] }
  display?: { name: string, icon?: string }
  experience?: { free: number, total: number }
  gate?: { name?: string, area: { uuid: string }, duration?: number }
  holder?: { uuid: string }
  material?: { weight: number, volume: number }
  playable: boolean
  soundness?: { current: number, total: number }
  event?: (
    | { type: 'player:character:create', entity: Required<Pick<Entity, 'display' | 'account'>> }
  )
}
export namespace Entity {

  export interface State {
    characters: string[],
    control?: string
  }
}

export default Entity;