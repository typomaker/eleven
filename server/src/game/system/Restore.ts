import * as game from "..";
import * as ecs from "../../ecs";

export class Restore extends ecs.System<game.Entity> {

  public readonly startpoint = ["7dbbb09c-397c-4770-a3e8-fe92fb4ad7a8"]

  private readonly preload: game.Entity[] = [
    {
      id: "7dbbb09c-397c-4770-a3e8-fe92fb4ad7a8",
      display: {
        name: "Hibernation center"
      },
      children: [
        "c9e609cb-fed5-4328-a3a4-1a042aa64f64"
      ]
    },
    {
      id: "eb9ba9a9-43c6-40fd-a0ea-d1f0b2445f42",
      display: {
        name: "Waiting hall"
      },
      children: [
        "0f5cad26-40d4-4770-94f7-99dada861db0"
      ]
    },
    {
      id: "c9e609cb-fed5-4328-a3a4-1a042aa64f64",
      display: {
        name: "To the waiting hall"
      },
      portal: {
        endpoint: "eb9ba9a9-43c6-40fd-a0ea-d1f0b2445f42"
      }
    },
    {
      id: "0f5cad26-40d4-4770-94f7-99dada861db0",
      display: {
        name: "To the hibernation center"
      },
      portal: {
        endpoint: "7dbbb09c-397c-4770-a3e8-fe92fb4ad7a8"
      }
    }
  ]

  constructor(private readonly world: game.World) {
    super()
  }

  public async started() {
    for (const entity of this.preload) {
      const stored = await game.repository.entity.find().id(entity.id).read().one()
      if (stored) this.world.entity.set(entity.id, stored)
      else this.world.entity.set(entity.id, entity)
    }
  }

  public async stoped() {
    for (const entity of this.preload) this.world.entity.delete(entity.id)
  }
}


export default Restore