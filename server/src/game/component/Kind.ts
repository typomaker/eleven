import Component from "./Component";

export type Kind<T extends string> = Component<"kind", T>
export default Kind;