export interface Character {
  name: string
  icon?: string
}
export namespace Character {
  export function is(v: any): v is Character {
    return v
      && typeof v.name === 'string'
      && (
        !v.icon
        || typeof v.icon === 'string'
      )
  }
}