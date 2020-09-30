import Component from "./Component";

export type HP = Component<"hp", { current: number, max: number }>
export default HP;