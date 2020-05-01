export abstract class Stash<Entity, Raw, Id> {
  private instance = new Map<Id, Entity>();
  private builder = new Map<Id, () => Entity>();
  private after = new Map<Id, (entity: Entity) => void>();

  public abstract async load(ids: Id[] | Raw[]): Promise<string[]>;

  public pick(id: Id): Entity | null;
  public pick(ids: Id[]): Entity[];
  public pick(ids: Id | Id[]): (Entity | null) | Entity[] {
    if (Array.isArray(ids)) {
      return ids.map((id) => this.pick(id)!);
    }
    if (!this.builder.has(ids)) return null;
    if (!this.instance.has(ids)) this.instance.set(ids, this.builder.get(ids)!());
    return this.instance.get(ids)!;
  }
  public register(id: Id, constructor: () => Entity) {
    this.builder.set(id, constructor);
    return constructor;
  }
  public unregister(id: Id) {
    this.instance.delete(id);
    this.builder.delete(id);
  }
  public has(id: Id) {
    return this.builder.has(id);
  }
  public filter(ids: Id[]) {
    return ids.filter((id) => this.has(id));
  }
}

export default Stash;
