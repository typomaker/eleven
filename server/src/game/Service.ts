import * as uuid from "uuid";
import * as app from "../app";
import Entity from "./Entity";
import Repository from "./Repository";

export class Service {
  public readonly entity = new Map<string, Entity>();
  public readonly repository = new Repository(this)
  constructor(public readonly app: app.Container) { }

  public async create(entity: Pick<Entity, 'type'> & Partial<Entity>) {
    switch (entity.type) {
      case 'character': {
        const locations = <Entity.Location[]>await this.repository.entity.find(['=', 'location.starting', true]).all()
        if (!locations) throw new Error('Starting location not found');
        const location = locations[Math.floor(Math.random() * locations.length)]
        if (!entity.name) throw new TypeError('character property name is required');
        if (!entity.account) throw new TypeError('character property account is required');
        const character: Entity.Character = {
          type: 'character',
          id: entity.id ?? uuid.v4(),
          name: entity.name,
          account: entity.account,
          location: entity.location ?? location,
        }
        if (entity.icon) character.icon = await this.upload('game', entity.icon)
        location.content.push(character)
        await this.repository.entity.save(character, location)
        return character;
      }
      default: throw new TypeError(`unexpected entity`)
    }
  }

  private async upload(bucket: 'game', data: string) {
    const [type, base64] = data.replace('data:', '').split(';base64,')
    let buffer = Buffer.from(base64, 'base64');
    const name = uuid.v4() + '.' + type.split('/')[1];
    await this.app.minio.putObject(bucket, name, buffer, Buffer.byteLength(buffer), {
      'Content-Type': type
    })
    return `/${bucket}/${name}`;
  }

  public async start() {
    for await (const entity of this.repository.entity.find(['in', 'type', ['location']])) {
      this.entity.set(entity.id, entity)
    }
  }
}

export default Service;