import * as uuid from 'uuid';
import Container from './Container';
export class Asset {
  private readonly bucket = 'game';
  constructor(private readonly app: Container) { }

  public async upload(data: string) {
    const [type, base64] = data.replace('data:', '').split(';base64,')
    const buffer = Buffer.from(base64, 'base64');
    const name = uuid.v4() + '.' + type.split('/')[1];
    await this.app.minio.putObject(this.bucket, name, buffer, Buffer.byteLength(buffer), {
      'Content-Type': type
    })
    return `/${name}`;
  }
}
export default Asset