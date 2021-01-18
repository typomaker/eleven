import Container from "./Container";
import Entity from "./Entity";

export class Query<T extends Entity> extends Container<T> {
  constructor(private readonly filter?: (id: any, component: T | undefined) => boolean) {
    super();
  }

  public set(id: any, component: T | undefined): void {
    if (!this.filter || this.filter(id, component)) {
      super.set(id, component);
    } else {
      super.set(id, undefined);
    }
  }
}

export namespace Query {

}


export default Query;