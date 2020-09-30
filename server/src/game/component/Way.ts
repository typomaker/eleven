import Entity from "../Entity";
import Component from "./Component";

export type Way = Component<"way", {
  destination: Entity.Location,
}[]>
export default Way;