export class Stash<Id, Entity> {
  private data = new Map<Id, Entity>();

  public get(id: Id): Entity | null;
  public get(id: Id, setter: () => Entity): Entity;
  public get(id: Id, setter?: () => Entity): Entity | null {
    return this.data.get(id) ?? (setter ? this.set(id, setter()) : null)
  }
  public set(id: Id, entity: Entity) {
    this.data.set(id, entity);
    return entity;
  }
  public delete(id: Id) {
    this.data.delete(id);
  }
  public has(id: Id) {
    return this.data.has(id);
  }
}

export default Stash;