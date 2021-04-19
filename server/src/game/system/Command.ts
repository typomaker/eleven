import * as uuid from "uuid";
import * as game from "..";
import * as account from "../../account";
import * as ecs from "../../ecs";
import * as minio from "../../minio";
import Entity from "../Entity";

export class Command extends ecs.System<Entity> {
  private readonly regexp = Object.freeze({
    name: /^[A-z][A-z0-9_]{2,19}$/
  })

  constructor(private readonly world: game.World) {
    super()
  }

  async updated(tick: ecs.World.Tick): Promise<any> {
    for (const entity of this.consumed) {
      if (Entity.is(entity, "playerCharacterCreation", "display")) {
        const id = entity.playerCharacterCreation;
        if (!entity.user) return this.produced.add(Entity.make({ error: Entity.Error.Code.UserRequired, parent: entity.id, user: entity.user }))
        if (!uuid.validate(id)) return this.produced.add(Entity.make({ error: Entity.Error.Code.UUIDNotValid, parent: entity.id, user: entity.user }))
        if (!this.regexp.name.test(entity.display.name)) return this.produced.add(Entity.make({ error: Entity.Error.Code.DisplayNameNotValid, parent: entity.id, user: entity.user }))

        const character = Entity.make({
          user: entity.user,
          active: false,
          display: {
            name: entity.display.name,
            icon: entity.display.icon ? await minio.game.upload(entity.display.icon) : undefined
          },
          experience: {
            free: 1000,
            total: 1000
          },
          indicator: {
            injury: 0,
            thirst: 0,
            hunger: 0,
          },
          ability: {
            medicine: {
              experience: 0
            },
            intelligence: {
              experience: 0
            },
            stamina: {
              experience: 0
            },
            strength: {
              experience: 0
            },
          },
          children: [],
          equipment: [],
        })

        const user = this.world.user.get(entity.user)
        if (!user) throw new Error(`user '${entity.user}' not found`)
        user.character.push(character.id)

        await game.repository.entity.save(character)
        await account.repository.user.save(user)
      } else if (Entity.is(entity, "playerCharacterActivation", "user")) {
        const id = entity.playerCharacterActivation;

        if (!entity.user) return this.produced.add(Entity.make({ error: Entity.Error.Code.UserRequired, parent: entity.id, user: entity.user }))

        const user = this.world.user.get(entity.user)

        if (!user) throw new Error(`user '${entity.user}' not found`)
        if (!user.character.includes(id)) throw new Error(`user '${entity.user}' haven't ${id} character`)

        const character = await game.repository.entity.find().id(id).read().one();
        if (!character) throw new Error(`character '${id}' not exists`);

        this.world.entity.set(character.id, character)
        this.produced.add(character)

      }
    }
  }
}

export default Command;