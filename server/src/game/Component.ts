export type Component = Partial<{
  name: Component.Name
  icon: Component.Icon
  health: Component.Health
  location: Component.Location
  route: Component.Route
}>

export namespace Component {
  export type Name = string
  export type Icon = string;
  export type Health = {
    current: number
    max: number
  }
  export type Location = {
    id: string
  }
  export type Route = {
    id: string
  }[]
}