export type Component<Name extends string, Data> = {
  [T in Name]: Data
}
export default Component;