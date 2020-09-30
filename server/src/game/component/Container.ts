import Entity from "../Entity";
import Component from "./Component";

export type Container = Component<"container", {
  kind?: Entity["kind"][]
  capaсity?: number
  content: Entity[]
}>
export default Container;