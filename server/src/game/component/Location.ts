import Entity from "../Entity";
import Component from "./Component";
export type Location = Component<"location", Entity.Location>
export default Location;