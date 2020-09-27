import Component from "./Component";
import Entity from "./Entity";

export interface Container<T extends Component<any>> {
  set(id: string, component: T | undefined): void;
  get(id: string): Readonly<T> | undefined;
  [Symbol.iterator](): IterableIterator<[Entity, Readonly<T>]>;
  readonly length: number
}

export default Container;