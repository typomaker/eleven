import * as ecsq from '../ecsq';
import Entity from './Entity';
import World from './World';

export class Event extends ecsq.System<Entity>{
  public query = {
    event: new ecsq.Query<Entity>((id, entity) => {
      return entity?.event !== undefined;
    })
  }

  public update(world: World) {
    for (const [id, entity] of this.query.event) {
      switch (entity.event.type) {
        case 'player:character:create': {

        }
      }
    }
  }
}